"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription, { BRUSH_FROM, BRUSH_TO } from "./Inscription";

export default function DisciplineSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleLeftRef = useRef<HTMLHeadingElement | null>(null);
  const titleRightRef = useRef<HTMLParagraphElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Opposing directional entrance choreographed with samurai preparing stance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // DISCIPLINE enters from the LEFT
      tl.fromTo(
        titleLeftRef.current,
        BRUSH_FROM,
        { ...BRUSH_TO, duration: 1.3, ease: "power2.out" }
      )
        // MASTER THE MIND BEFORE THE BLADE enters from the RIGHT
        .fromTo(
          titleRightRef.current,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.3, ease: "power3.out" },
          "-=1.0"
        )
        // Description emerges smoothly
        .fromTo(
          descRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          "-=0.7"
        );

      // Section exit transition
      gsap.to(contentWrapperRef.current, {
        y: -100,
        opacity: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "60% top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[175vh] w-full select-none bg-transparent overflow-clip"
    >
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-end px-6 pb-14 wide:px-[4.5vw] wide:pb-20">
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 flex items-end gap-6 wide:ml-auto wide:w-[36vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            {/* Discipline arrives from the left, its maxim answers from the right */}
            <h2
              ref={titleLeftRef}
              className="display text-5xl text-bone ink-shadow sm:text-7xl wide:text-[clamp(1.75rem,4.4vw,5.75rem)]"
            >
              Discipline.
            </h2>

            <p
              ref={titleRightRef}
              className="mt-4 font-mincho text-2xl leading-snug text-bone/90 ink-shadow sm:text-3xl wide:text-[clamp(1.1rem,1.9vw,2.25rem)]"
            >
              Master the mind before the blade.
            </p>

            <p ref={descRef} className="lede ink-shadow mt-7">
              Ten thousand repetitions before the cut becomes involuntary. Power
              unanchored by discipline is merely reckless violence. True strength is
              the absolute command of stillness.
            </p>
          </div>

          <Inscription seal="弐" kanji="鍛錬" reading="Tanren" />
        </div>
      </div>
    </section>
  );
}
