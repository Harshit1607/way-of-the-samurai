"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import framesList from "../../public/frames.json";

// Source resolution of /frames_webp (see walkthrough.md)
const FRAME_W = 1600;
const FRAME_H = 900;

interface SamuraiBackgroundCanvasProps {
  cachedImages?: HTMLImageElement[];
}

export default function SamuraiBackgroundCanvas({
  cachedImages,
}: SamuraiBackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  // Continuous sub-frame interpolation and 2nd-order spring physics state
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const velocityRef = useRef(0);
  const isRunningRef = useRef(false);
  const lastTimeRef = useRef(0);
  // Redraws the resting frame if the frame that just loaded is on screen
  const onFrameLoadRef = useRef<(index: number) => void>(() => {});
  // Frames come from the Preloader's staged stream (first 100 eagerly, rest in batches).
  // The canvas only draws on scroll/resize, so without this the first frame (and any frame that
  // streams in after a fast scroll) never paints until the user scrolls.
  useEffect(() => {
    if (!cachedImages || cachedImages.length === 0) return;
    imagesRef.current = cachedImages;

    const listeners = cachedImages.map((img, i) => {
      const onLoad = () => onFrameLoadRef.current(i);
      img.addEventListener("load", onLoad);
      return () => img.removeEventListener("load", onLoad);
    });
    // Some frames may have decoded (or come from cache) before these listeners existed
    onFrameLoadRef.current(-1);

    return () => listeners.forEach((off) => off());
  }, [cachedImages]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true }) || canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // Retrieve the closest valid, decoded image for a given index
    const getValidImage = (index: number): HTMLImageElement | null => {
      const images = imagesRef.current;
      if (!images || images.length === 0) return null;

      const img = images[index];
      if (img && img.complete && img.naturalWidth > 0) {
        return img;
      }

      // Backward search for nearest loaded frame
      for (let i = index - 1; i >= 0; i--) {
        if (images[i]?.complete && images[i]?.naturalWidth > 0) {
          return images[i];
        }
      }

      // Forward search if early in sequence
      for (let i = index + 1; i < images.length; i++) {
        if (images[i]?.complete && images[i]?.naturalWidth > 0) {
          return images[i];
        }
      }

      return null;
    };
    /**
     * Multi-Dimensional Temporal Optical Flow & Sub-Frame Morphing:
     * 1. Quintic Smootherstep: C² continuous alpha cross-fade eliminating derivative boundary cusps.
     * 2. Sub-Frame Affine Morphing: Micro-scales Frame A (+t) and Frame B (-(1-t)) around the samurai's
     *    focal axis to lock geometric silhouettes in place during transitions.
     * 3. Velocity-Adaptive Shutter Blur: Synthesizes temporal anti-aliasing during rapid scrubbing.
     */
    const renderInterpolatedFrame = (progress: number, velocity: number = 0) => {
      const total = framesList.length;
      if (total <= 0) return;

      const clamped = Math.min(1, Math.max(0, progress));
      const exactFrame = clamped * (total - 1);
      const frameA = Math.floor(exactFrame);
      const frameB = Math.min(total - 1, frameA + 1);
      const rawBlend = exactFrame - frameA; // Fractional remainder 0.0 to 1.0

      // Quintic Smootherstep (6t^5 - 15t^4 + 10t^3): 0 first & second derivatives at integer boundaries
      const blend = rawBlend * rawBlend * rawBlend * (rawBlend * (rawBlend * 6 - 15) + 10);

      const imgA = getValidImage(frameA);
      if (!imgA) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = imgA.naturalWidth || 1920;
      const ih = imgA.naturalHeight || 1080;

      // Base cover viewport scaling
      const baseScale = Math.max(cw / iw, ch / ih);
      const baseNw = iw * baseScale;
      const baseNh = ih * baseScale;
      const baseOffsetX = (cw - baseNw) * 0.5;
      const baseOffsetY = (ch - baseNh) * 0.5;

      // Focal point of shot: Samurai center-of-mass (42% X, 50% Y)
      const focalX = baseOffsetX + baseNw * 0.42;
      const focalY = baseOffsetY + baseNh * 0.50;

      // Subtle sub-frame affine expansion rate matching the camera dolly-in speed
      const MORPH_RATE = 0.00065;
      const scaleA = 1.0 + rawBlend * MORPH_RATE;
      const scaleB = 1.0 - (1.0 - rawBlend) * MORPH_RATE;

      // Calculate affine bounds for Frame A
      const nwA = Math.round(baseNw * scaleA);
      const nhA = Math.round(baseNh * scaleA);
      const offsetXA = Math.round(focalX * (1 - scaleA) + baseOffsetX * scaleA);
      const offsetYA = Math.round(focalY * (1 - scaleA) + baseOffsetY * scaleA);

      // Clear only if transformed bounds expose canvas edges
      if (offsetXA > 0 || offsetYA > 0 || nwA < cw || nhA < ch) {
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, cw, ch);
      }

      // 1. Draw base Frame A with affine forward-morphing
      ctx.globalAlpha = 1.0;
      ctx.drawImage(imgA, offsetXA, offsetYA, nwA, nhA);

      // 2. Draw incoming Frame B with complementary affine contracting morph & smootherstep alpha
      if (blend > 0.001 && frameB !== frameA) {
        const imgB = getValidImage(frameB);
        if (imgB && imgB !== imgA) {
          const nwB = Math.round(baseNw * scaleB);
          const nhB = Math.round(baseNh * scaleB);
          const offsetXB = Math.round(focalX * (1 - scaleB) + baseOffsetX * scaleB);
          const offsetYB = Math.round(focalY * (1 - scaleB) + baseOffsetY * scaleB);

          ctx.globalAlpha = blend;
          ctx.drawImage(imgB, offsetXB, offsetYB, nwB, nhB);
          ctx.globalAlpha = 1.0;
        }
      }

      // 3. Velocity-Adaptive Shutter Blur (Temporal Anti-Aliasing for fast scrolls)
      const vFps = Math.abs(velocity) * (total - 1);
      if (vFps > 6.0) {
        const blurAlpha = Math.min(0.14, (vFps - 6.0) * 0.0035);
        const motionDirection = velocity >= 0 ? 1 : -1;
        const frameC = Math.max(0, Math.min(total - 1, frameA + motionDirection * 2));
        if (frameC !== frameA && frameC !== frameB) {
          const imgC = getValidImage(frameC);
          if (imgC) {
            ctx.globalAlpha = blurAlpha;
            ctx.drawImage(imgC, offsetXA, offsetYA, nwA, nhA);
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // 4. Background-warm upcoming frames in GPU texture cache
      const images = imagesRef.current;
      if (images && images.length > 0) {
        const lookaheadDir = velocity >= 0 ? 1 : -1;
        for (let offset = 1; offset <= 4; offset++) {
          const nextIdx = frameA + offset * lookaheadDir;
          if (nextIdx >= 0 && nextIdx < images.length && images[nextIdx]?.complete) {
            images[nextIdx]?.decode?.().catch(() => {});
          }
        }
      }
    };

    // Hardware-accelerated 2nd-order critically-damped spring RAF loop for ultra-smooth temporal motion
    const requestTick = () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      lastTimeRef.current = performance.now();

      const OMEGA = 18.0; // Spring frequency: rapid, fluid, zero latency

      const step = (now: number) => {
        const dt = Math.min((now - (lastTimeRef.current || now)) / 1000, 0.064);
        lastTimeRef.current = now;

        const x = currentProgressRef.current;
        const xt = targetProgressRef.current;
        const v = velocityRef.current;
        const diff = xt - x;

        // 2nd-order critically-damped spring-damper exact analytical solution (zeta = 1.0)
        const expTerm = Math.exp(-OMEGA * dt);
        const c1 = x - xt;
        const c2 = v + OMEGA * c1;
        const xNew = xt + (c1 + c2 * dt) * expTerm;
        const vNew = (v - OMEGA * c2 * dt) * expTerm;

        currentProgressRef.current = xNew;
        velocityRef.current = vNew;

        // Continue as long as position or velocity delta remains
        if (Math.abs(diff) > 1e-7 || Math.abs(vNew) > 1e-6) {
          renderInterpolatedFrame(currentProgressRef.current, velocityRef.current);
          requestAnimationFrame(step);
        } else {
          currentProgressRef.current = targetProgressRef.current;
          velocityRef.current = 0;
          renderInterpolatedFrame(currentProgressRef.current, 0);
          isRunningRef.current = false;
        }
      };

      requestAnimationFrame(step);
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Never allocate more canvas pixels than the source frame can fill: past that it's the same
      // upscaled image, just 2 full-screen drawImage calls per tick at up to 4x the fill cost.
      const coverScale = Math.max(width / FRAME_W, height / FRAME_H);
      const dpr = Math.min(window.devicePixelRatio || 1, 2, 1 / coverScale);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      renderInterpolatedFrame(currentProgressRef.current);
    };

    // -1 means "just redraw"; otherwise only redraw when the loaded frame is one of the two being blended
    onFrameLoadRef.current = (index: number) => {
      if (isRunningRef.current) return; // the lerp loop is already drawing every frame
      const frameA = Math.floor(currentProgressRef.current * (framesList.length - 1));
      if (index === -1 || Math.abs(index - frameA) <= 1) {
        renderInterpolatedFrame(currentProgressRef.current);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const updateTargetProgress = (progress: number) => {
      targetProgressRef.current = Math.min(1, Math.max(0, progress));
      requestTick();
    };

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
      onFrameLoadRef.current = () => {};
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("lenis-scroll", handleLenisScroll);
      st.kill();
    };
  }, []);

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
