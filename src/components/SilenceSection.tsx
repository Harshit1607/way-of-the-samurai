"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription from "./Inscription";

export default function SilenceSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const aphorismRef = useRef<HTMLDListElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Dramatically slowed sequence reflecting the stillness after the strike
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // Line 1: AFTER THE STRIKE, (reveals very slowly and gently)
      tl.fromTo(
        line1Ref.current,
        { opacity: 0, y: 30, letterSpacing: "0.2em" },
        {
          opacity: 1,
          y: 0,
          letterSpacing: "0em",
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
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 20 },
          { opacity: 0.9, y: 0, duration: 1.8, ease: "power2.out" },
          "-=1.4"
        )
        .fromTo(
          aphorismRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.6, ease: "power2.out" },
          "-=1.2"
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
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-end px-6 pb-14 wide:px-[4.5vw] wide:pb-28">
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 flex items-end gap-6 wide:ml-auto wide:w-[32vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            {/* The slowest passage on the page: a light line, then the one word in vermilion */}
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

            <p ref={subRef} className="lede ink-shadow mt-8">
              Not the absence of sound, but the stillness of the mind. The world
              fades until nothing remains except absolute clarity.
            </p>

            <dl ref={aphorismRef} className="note mt-8 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 ink-shadow">
              <dt lang="ja-Latn" className="text-bone">Mushin</dt>
              <dd>No-mind</dd>
              <dt lang="ja-Latn" className="text-bone">Fudōshin</dt>
              <dd>The immovable heart</dd>
            </dl>
          </div>

          <Inscription seal="伍" kanji="静寂" reading="Seijaku" />
        </div>
      </div>
    </section>
  );
}
