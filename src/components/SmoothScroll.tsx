"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // ponytail: timed entrances finish instantly for reduced motion; scroll-scrubbed ones still follow the scroll.
    // Per-tween gsap.matchMedia branches if some motion should survive.
    if (reduceMotion) gsap.globalTimeline.timeScale(1000);

    const lenis = new Lenis({
      duration: 2.0, // High-end cinematic scroll duration with sustained momentum
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: !reduceMotion,
      wheelMultiplier: 0.8, // Calibrated wheel sensitivity to prevent sudden frame jumps
      touchMultiplier: 1.6,
      syncTouch: true,
      syncTouchLerp: 0.08,
      autoRaf: false,
    });

    lenisRef.current = lenis;

    // Expose Lenis instance globally so replay buttons and canvas can interact with it
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    // Synchronize Lenis scroll position with GSAP ScrollTrigger & dispatch event
    lenis.on("scroll", (e) => {
      ScrollTrigger.update();
      window.dispatchEvent(
        new CustomEvent("lenis-scroll", {
          detail: {
            progress: e.progress,
            scroll: e.scroll,
            limit: e.limit,
            velocity: e.velocity,
          },
        })
      );
    });

    // Synchronize GSAP ticker with Lenis raf
    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      clearTimeout(timer);
      gsap.ticker.remove(updateLenis);
      gsap.globalTimeline.timeScale(1);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <div className="relative w-full">{children}</div>;
}
