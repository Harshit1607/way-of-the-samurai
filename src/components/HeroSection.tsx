"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription, { BRUSH_FROM, BRUSH_TO } from "./Inscription";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const subtitleRef = useRef<HTMLParagraphElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const badgeRef = useRef<HTMLElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);
  const cueRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial Opening Title Sequence (Masked Rising Reveal)
      const tl = gsap.timeline({ delay: 0.3 });

      tl.fromTo(
        badgeRef.current,
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
      )
        // Line 1: THE WAY OF (Masked clip-reveal sliding up from invisible boundary)
        .fromTo(
          line1Ref.current,
          BRUSH_FROM,
          { ...BRUSH_TO, duration: 1.3, ease: "power2.out" },
          "-=0.6"
        )
        // Line 2: the samurai (heavier weight carries the emphasis)
        .fromTo(
          line2Ref.current,
          BRUSH_FROM,
          { ...BRUSH_TO, duration: 1.3, ease: "power2.out" },
          "-=0.9"
        )
        // Subtitle: HONOUR · DISCIPLINE · PRECISION (Letter spacing compression)
        .fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20, letterSpacing: "0.6em" },
          {
            opacity: 1,
            y: 0,
            letterSpacing: "0.28em",
            duration: 1.4,
            ease: "power2.out",
          },
          "-=0.7"
        )
        .fromTo(
          descRef.current,
          { opacity: 0, y: 20 },
          { opacity: 0.85, y: 0, duration: 1.1, ease: "power2.out" },
          "-=0.8"
        );

      // 2. Scroll Exit Choreography: Smooth upward editorial exit as user scrolls into Honour
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

      // 3. Scroll cue appears after the title sequence and fades on the first bit of scroll
      gsap.fromTo(cueRef.current, { opacity: 0 }, { opacity: 1, duration: 1, delay: 2.6 });
      gsap.to(cueRef.current, {
        opacity: 0,
        immediateRender: false,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "8% top",
          scrub: true,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[160vh] w-full select-none bg-transparent"
    >
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-between px-6 py-7 wide:px-[4.5vw] wide:py-10">
        {/* Masthead: seal emblem and colophon, a hairline under it like a scroll's upper border */}
        <header ref={badgeRef} className="relative z-10 flex items-center justify-between border-b border-bone/15 pb-5">
          <div className="flex items-center gap-4">
            <span className="seal h-9 w-9 -rotate-2 text-base">七</span>
            <div className="flex flex-col gap-1">
              <span className="font-mincho text-sm font-bold tracking-wide text-bone ink-shadow">
                The Jade Samurai
              </span>
              <span className="note">Chronicles, vol. 1</span>
            </div>
          </div>
          <span className="note hidden wide:block">
            Kyoto <span className="tabular-nums text-bone">1642</span>
          </span>
        </header>

        {/* Title block in the right-hand column, clear of the samurai */}
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 mt-auto mb-10 flex items-end gap-6 wide:mb-14 wide:ml-auto wide:w-[38vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            <h1 className="display text-5xl text-bone ink-shadow sm:text-7xl wide:text-[clamp(2rem,4.8vw,6rem)]">
              <span className="block">
                <span ref={line1Ref} className="block font-normal">The way of</span>
              </span>
              <span className="block">
                <span ref={line2Ref} className="block">the samurai</span>
              </span>
            </h1>

            {/* Three virtues, set as a single spaced line */}
            <p
              ref={subtitleRef}
              className="note mt-7 text-bone ink-shadow"
            >
              Honour <span className="text-shu">·</span> Discipline <span className="text-shu">·</span> Precision
            </p>

            <p ref={descRef} className="lede ink-shadow mt-4">
              The warrior rests in absolute stillness. As you scroll, the camera never
              cuts. Watch the unbroken sequence unfold beneath your fingertips.
            </p>
          </div>

          <Inscription seal="序" kanji="武士道" reading="Bushidō" delay={1.1} />
        </div>

        {/* Scroll cue: a single ink drip down a hairline */}
        <div
          ref={cueRef}
          className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 opacity-0 wide:flex"
        >
          <span className="note text-bone/80">Scroll</span>
          <span className="relative block h-12 w-px overflow-hidden bg-bone/20">
            <span className="absolute inset-x-0 top-0 h-1/2 bg-shu animate-[scrollCue_1.8s_ease-in-out_infinite]" />
          </span>
        </div>
      </div>
    </section>
  );
}
