"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription, { revealOnEnter, exitOnLeave } from "./Inscription";

export default function SilenceSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Dramatically slowed sequence reflecting the stillness after the strike
      const tl = gsap.timeline({ paused: true });
      revealOnEnter(tl, containerRef.current!);

      // Line 1: AFTER THE STRIKE, (reveals very slowly and gently)
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 30, filter: "blur(4px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 2.2,
          ease: "power2.out",
        }
      )
        // Line 2: silence. in vermilion
        .fromTo(
          line2Ref.current,
          { opacity: 0, scale: 0.92, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 2.6,
            ease: "power2.out",
          },
          "-=1.0"
        );

      // Section exit transition
      exitOnLeave(contentWrapperRef.current, containerRef.current);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[175vh] w-full bg-transparent overflow-clip"
    >
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-end px-6 pb-[max(3.5rem,calc(env(safe-area-inset-bottom)+2rem))] wide:px-[4.5vw] wide:pb-28">
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 flex items-end gap-6 wide:ml-auto wide:w-[32vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            {/* The page's one breath after the strike: a light line, the one word in vermilion, nothing else */}
            <h2>
              <span
                ref={line1Ref}
                className="block font-mincho text-3xl font-normal leading-tight text-bone ink-shadow sm:text-5xl wide:text-[clamp(1.1rem,2.6vw,3.5rem)]"
              >
                After the strike,
              </span>
              <span
                ref={line2Ref}
                className="display mt-1 block origin-left text-6xl text-shu ink-shadow sm:text-8xl wide:text-[clamp(2rem,5.6vw,6rem)]"
              >
                silence.
              </span>
            </h2>
          </div>

          <Inscription seal="伍" kanji="静寂" reading="Seijaku" />
        </div>
      </div>
    </section>
  );
}
