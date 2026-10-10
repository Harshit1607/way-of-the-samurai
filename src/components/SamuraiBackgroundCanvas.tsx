"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import framesList from "../../public/frames.json";
import type { FrameStore } from "@/lib/frameStore";

// Source resolution of /frames_webp (see walkthrough.md)
const FRAME_W = 1600;
const FRAME_H = 900;

// Decoded-bitmap window around the playhead. Drawing a frame that isn't decoded yet forces a
// synchronous ~10ms WebP decode on the main thread, so frames are decoded off-thread
// (createImageBitmap on a Blob) ahead of the playhead and only decoded frames are ever drawn.
// A fast scroll covers far more frames per display refresh than can be decoded, so the decode
// window spreads out with scroll speed (every Nth frame) and the canvas interpolates between
// whichever decoded frames bracket the playhead.
const DECODE_AHEAD = 16; // decode slots ahead of the playhead, in the scroll direction
const DECODE_BEHIND = 6; // frames decoded behind it when scrolling slowly, for small reversals
const MAX_STRIDE = 12; // widest spacing between decoded frames during fast scrolls
const MAX_DECODED = 40; // bitmaps kept at once (~5MB each at 1440x900)
const MAX_IN_FLIGHT = 6;
const RESIZE_REDECODE_DELAY = 150; // ms; re-decode at the new canvas size once resizing settles

interface SamuraiBackgroundCanvasProps {
  frames: FrameStore | null;
}

interface DecodedFrame {
  bitmap: ImageBitmap;
  generation: number; // canvas size the bitmap was decoded for
}

export default function SamuraiBackgroundCanvas({ frames }: SamuraiBackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Scroll progress (0..1) the spring is chasing, and the spring's current position/velocity
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    if (!frames) return;
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Not `desynchronized`: that bypasses the compositor's vsync and tears during continuous motion
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const total = framesList.length;
    if (total <= 0) return;

    const decoded = new Map<number, DecodedFrame>();
    const inFlight = new Set<number>();
    const failed = new Set<number>();
    let generation = 0;
    let direction = 1; // 1 = scrolling forward through the film, -1 = backward
    let stride = 1; // spacing of the decode window, grows with scroll speed
    let disposed = false;
    let rafId = 0;
    let isRunning = false;
    let lastTime = 0;
    let resizeTimer: number | undefined;

    const playhead = () => Math.floor(Math.min(1, Math.max(0, currentProgressRef.current)) * (total - 1));

    // Decoded frames on either side of `exactFrame`, nearest first; [-1, -1] if none
    const bracket = (exactFrame: number): [number, number] => {
      let lo = -1;
      let hi = -1;
      for (const index of decoded.keys()) {
        if (index <= exactFrame) {
          if (index > lo) lo = index;
        } else if (hi === -1 || index < hi) {
          hi = index;
        }
      }
      return [lo, hi];
    };

    // ImageBitmap.close() frees the pixels synchronously (~1-2ms each), so evicted frames are
    // released in idle time instead of inside a scroll frame
    const releaseQueue: ImageBitmap[] = [];
    let releaseScheduled = false;
    const flushReleases = () => {
      releaseScheduled = false;
      releaseQueue.splice(0).forEach((bitmap) => bitmap.close());
    };
    const release = (bitmap: ImageBitmap) => {
      releaseQueue.push(bitmap);
      if (releaseScheduled) return;
      releaseScheduled = true;
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(flushReleases, { timeout: 1000 });
      else setTimeout(flushReleases, 200);
    };

    const decode = (index: number, blob: Blob) => {
      inFlight.add(index);
      const decodeGeneration = generation;
      const cw = canvas.width;
      const ch = canvas.height;
      // Crop to the "cover" region visible on this canvas and scale to canvas pixels, so drawing is a 1:1 blit
      const scale = Math.max(cw / FRAME_W, ch / FRAME_H);
      const sw = Math.min(FRAME_W, Math.round(cw / scale));
      const sh = Math.min(FRAME_H, Math.round(ch / scale));
      const options: ImageBitmapOptions =
        sw === cw && sh === ch ? {} : { resizeWidth: cw, resizeHeight: ch, resizeQuality: "high" };
      createImageBitmap(blob, Math.round((FRAME_W - sw) / 2), Math.round((FRAME_H - sh) / 2), sw, sh, options).then(
        (bitmap) => {
          inFlight.delete(index);
          // Frames the playhead has already passed are no longer useful
          if (disposed || (index - playhead()) * direction < -DECODE_BEHIND * stride) {
            release(bitmap);
          } else {
            const previous = decoded.get(index);
            if (previous) release(previous.bitmap);
            decoded.set(index, { bitmap, generation: decodeGeneration });
            // The spring loop redraws every tick; at rest, repaint in case this frame is on screen
            if (!isRunning) render(currentProgressRef.current, 0);
          }
          pump();
        },
        () => {
          inFlight.delete(index);
          failed.add(index);
          pump();
        }
      );
    };

    // Decode the nearest missing frames (scroll direction first, every `stride`-th frame when
    // scrolling fast), and release the least useful bitmaps once over the memory cap
    const pump = () => {
      if (disposed) return;
      const center = playhead();

      if (decoded.size > MAX_DECODED) {
        // Frames behind the playhead go first, then the furthest ahead
        const cost = (index: number) => {
          const offset = (index - center) * direction;
          return offset < 0 ? -offset * 3 : offset;
        };
        const byCost = [...decoded.keys()].sort((a, b) => cost(b) - cost(a));
        for (const index of byCost.slice(0, decoded.size - MAX_DECODED)) {
          release(decoded.get(index)!.bitmap);
          decoded.delete(index);
        }
      }

      // Slots sit on a stride-aligned grid so they stay put while the playhead moves
      const gridBase = direction > 0 ? Math.floor(center / stride) : Math.ceil(center / stride);
      const wanted: number[] = stride === 1 ? [center, center + direction] : [];
      for (let k = 1; k <= DECODE_AHEAD; k++) {
        wanted.push((gridBase + k * direction) * stride);
        if (stride === 1 && k <= DECODE_BEHIND) wanted.push(center - k * direction);
      }

      for (const index of wanted) {
        if (inFlight.size >= MAX_IN_FLIGHT) break;
        if (index < 0 || index >= total || inFlight.has(index) || failed.has(index)) continue;
        if (decoded.get(index)?.generation === generation) continue;
        const blob = frames.blobs[index];
        if (blob) decode(index, blob);
      }
    };

    /**
     * Draws the film at a fractional frame position with opacity `alpha`: a linear cross-fade of
     * the two decoded frames that bracket it (neighbours when scrolling slowly, `stride` apart when
     * fast). Linear weighting keeps the image changing at a constant rate under a constant scroll;
     * an eased curve (smoothstep etc.) holds each frame and rushes between them, which reads as
     * judder. Exact for alpha = 1; a close approximation for the faint shutter-blur layer.
     * Returns false when nothing near `position` is decoded.
     */
    const drawAt = (position: number, alpha: number): boolean => {
      const cw = canvas.width;
      const ch = canvas.height;
      const [lo, hi] = bracket(position);
      if (lo === -1 && hi === -1) return false;

      let base = lo === -1 ? hi : lo;
      let blend = 0;
      if (lo !== -1 && hi !== -1) {
        if (hi - lo <= 2 * MAX_STRIDE) blend = (position - lo) / (hi - lo);
        else if (hi - position < position - lo) base = hi; // gap too wide to blend across: nearer frame
      }

      ctx.globalAlpha = alpha;
      ctx.drawImage(decoded.get(base)!.bitmap, 0, 0, cw, ch);
      if (blend > 0.001) {
        ctx.globalAlpha = alpha * blend;
        ctx.drawImage(decoded.get(hi)!.bitmap, 0, 0, cw, ch);
      }
      return true;
    };

    // During fast scrubs the film a little further along is layered in faintly as shutter blur;
    // it is interpolated like the base so it fades continuously instead of popping per frame.
    const render = (progress: number, velocity: number) => {
      const exactFrame = Math.min(1, Math.max(0, progress)) * (total - 1);
      if (!drawAt(exactFrame, 1)) return; // nothing decoded yet: keep whatever is on the canvas

      const framesPerSecond = Math.abs(velocity) * (total - 1);
      if (framesPerSecond > 6) {
        const lead = Math.max(2, stride) * (velocity >= 0 ? 1 : -1);
        const ghost = Math.max(0, Math.min(total - 1, exactFrame + lead));
        drawAt(ghost, Math.min(0.14, (framesPerSecond - 6) * 0.0035));
      }
      ctx.globalAlpha = 1;
    };

    // Critically-damped spring (zeta = 1), integrated exactly, chasing the scroll progress
    const OMEGA = 18.0;
    const step = (now: number) => {
      // rAF timestamps are the frame's start time and can precede the performance.now() taken in
      // requestTick; a negative dt would make the exponential grow and the spring overshoot
      const dt = Math.min(Math.max(0, now - (lastTime || now)) / 1000, 0.064);
      lastTime = now;

      const x = currentProgressRef.current;
      const xt = targetProgressRef.current;
      const v = velocityRef.current;

      const expTerm = Math.exp(-OMEGA * dt);
      const c1 = x - xt;
      const c2 = v + OMEGA * c1;
      const xNew = xt + (c1 + c2 * dt) * expTerm;
      const vNew = (v - OMEGA * c2 * dt) * expTerm;

      if (Math.abs(xt - x) > 1e-7 || Math.abs(vNew) > 1e-6) {
        currentProgressRef.current = xNew;
        velocityRef.current = vNew;
        // Frames the playhead crosses per 60Hz refresh sets how sparsely to decode ahead
        stride = Math.min(MAX_STRIDE, Math.max(1, Math.ceil((Math.abs(vNew) * (total - 1)) / 60)));
        pump();
        render(xNew, vNew);
        rafId = requestAnimationFrame(step);
      } else {
        currentProgressRef.current = xt;
        velocityRef.current = 0;
        stride = 1;
        pump();
        render(xt, 0);
        isRunning = false;
      }
    };

    const requestTick = () => {
      if (isRunning) return;
      isRunning = true;
      lastTime = performance.now();
      rafId = requestAnimationFrame(step);
    };

    const updateTargetProgress = (progress: number) => {
      const next = Math.min(1, Math.max(0, progress));
      if (next !== currentProgressRef.current) direction = next > currentProgressRef.current ? 1 : -1;
      targetProgressRef.current = next;
      requestTick();
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Never allocate more canvas pixels than the source frame can fill: past that it's the same
      // upscaled image at up to 4x the fill and decode cost.
      const coverScale = Math.max(width / FRAME_W, height / FRAME_H);
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 1 / coverScale);
      const nextWidth = Math.round(width * dpr);
      const nextHeight = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      if (nextWidth === canvas.width && nextHeight === canvas.height) return;

      canvas.width = nextWidth;
      canvas.height = nextHeight;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, nextWidth, nextHeight);
      // Bitmaps decoded for the old size are stretched to fit until the re-decode lands
      render(currentProgressRef.current, 0);

      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        generation++;
        pump();
      }, RESIZE_REDECODE_DELAY);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Frames stream in after mount; decode the ones that land near the playhead
    const unsubscribe = frames.subscribe((index) => {
      if (Math.abs(index - playhead()) <= DECODE_AHEAD * stride) pump();
    });
    pump();

    // 1. Direct Lenis smooth scroll event listener
    const handleLenisScroll = (e: Event) => {
      const customEvent = e as CustomEvent<{ progress: number }>;
      if (customEvent.detail && typeof customEvent.detail.progress === "number") {
        updateTargetProgress(customEvent.detail.progress);
      }
    };
    window.addEventListener("lenis-scroll", handleLenisScroll);

    // 2. GSAP ScrollTrigger sync as anchor and fallback
    const st = ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        updateTargetProgress(self.progress);
      },
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimer);
      unsubscribe();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("lenis-scroll", handleLenisScroll);
      st.kill();
      decoded.forEach((entry) => entry.bitmap.close());
      decoded.clear();
      flushReleases();
    };
  }, [frames]);

  return (
    /* Persistent Full-Viewport Canvas Background: Pure 60FPS Cross-Faded Film Shot */
    <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none select-none bg-[#050505]">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* Minimal Subtle Vignette to ensure text readability without dimming the samurai */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />

      {/* Text-side scrims: copy lives in the right column on desktop (clear of the samurai), bottom band on mobile */}
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-black/55 via-black/20 to-transparent wide:block" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/35 to-transparent wide:hidden" />
    </div>
  );
}
