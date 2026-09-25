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
  
  // Continuous sub-frame interpolation state
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const isRunningRef = useRef(false);

  // Frames come from the Preloader's staged stream (first 100 eagerly, rest in batches)
  useEffect(() => {
    if (cachedImages && cachedImages.length > 0) {
      imagesRef.current = cachedImages;
    }
  }, [cachedImages]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;


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
     * Dual-Frame Cross-Fade Interpolation:
     * Blends frame A and frame B using the fractional sub-frame position.
     * Melts discrete frames into a buttery continuous 60FPS motion flow.
     */
    const renderInterpolatedFrame = (progress: number) => {
      const total = framesList.length;
      if (total <= 0) return;

      const clamped = Math.min(1, Math.max(0, progress));
      const exactFrame = clamped * (total - 1);
      const frameA = Math.floor(exactFrame);
      const frameB = Math.min(total - 1, frameA + 1);
      const blend = exactFrame - frameA; // Fractional remainder 0.0 to 1.0

      const imgA = getValidImage(frameA);
      if (!imgA) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const iw = imgA.naturalWidth || 1920;
      const ih = imgA.naturalHeight || 1080;

      // Full cover viewport scaling
      const scale = Math.max(cw / iw, ch / ih);
      const nw = iw * scale;
      const nh = ih * scale;
      const offsetX = (cw - nw) * 0.5;
      const offsetY = (ch - nh) * 0.5;

      ctx.fillStyle = "#050505";
      ctx.fillRect(0, 0, cw, ch);

      // Render base frame A
      ctx.globalAlpha = 1.0;
      ctx.drawImage(imgA, offsetX, offsetY, nw, nh);

      // Interpolate frame B on top using sub-frame alpha cross-fade
      if (blend > 0.005 && frameB !== frameA) {
        const imgB = getValidImage(frameB);
        if (imgB && imgB !== imgA) {
          ctx.globalAlpha = blend;
          ctx.drawImage(imgB, offsetX, offsetY, nw, nh);
          ctx.globalAlpha = 1.0;
        }
      }
    };

    // Hardware-accelerated RAF Lerp loop for sub-frame smoothing
    const requestTick = () => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;

      const step = () => {
        const diff = targetProgressRef.current - currentProgressRef.current;

        // Continue interpolating as long as there is noticeable delta
        if (Math.abs(diff) > 0.00005) {
          // 0.12 lerp factor yields silky, cinematic responsiveness
          currentProgressRef.current += diff * 0.12;
          renderInterpolatedFrame(currentProgressRef.current);
          requestAnimationFrame(step);
        } else {
          currentProgressRef.current = targetProgressRef.current;
          renderInterpolatedFrame(currentProgressRef.current);
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
      renderInterpolatedFrame(currentProgressRef.current);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Initial render of Frame 001
    const initialTimer = setTimeout(() => {
      renderInterpolatedFrame(0);
    }, 60);

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
      clearTimeout(initialTimer);
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
