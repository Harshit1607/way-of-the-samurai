"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription from "./Inscription";

export default function ThePathSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titlePathRef = useRef<HTMLHeadingElement | null>(null);
  const titleDemandsRef = useRef<HTMLParagraphElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const tagsRef = useRef<HTMLUListElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Initial entrance of tag, body, and tags
      const enterTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 65%",
          toggleActions: "play none none reverse",
        },
      });

      enterTl
        .fromTo(
          subRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" }
        )
        .fromTo(
          tagsRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" },
          "-=0.7"
        );

      // 2. 1:1 Scroll-Scrubbed Katana Draw Synchronization
      // As the user scrubs through the draw, THE PATH scales from 0.85 to 1.0 and DEMANDS EVERYTHING compresses letter-spacing
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 40%",
          end: "50% top",
          scrub: 0.8,
        },
      });

      scrubTl
        .fromTo(
          titlePathRef.current,
          { scale: 0.85, y: 35, opacity: 0.4 },
          { scale: 1, y: 0, opacity: 1, ease: "none" }
        )
        .fromTo(
          titleDemandsRef.current,
          { letterSpacing: "0.4em", opacity: 0.4 },
          { letterSpacing: "0em", opacity: 1, ease: "none" },
          "<"
        );

      // 3. Section exit transition
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
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-end px-6 pb-14 wide:justify-start wide:px-[4.5vw] wide:pb-0 wide:pt-24">
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 flex items-start gap-6 wide:ml-auto wide:w-[36vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            {/* The path: scale bound 1:1 to the draw */}
            <h2
              ref={titlePathRef}
              className="display origin-left text-5xl text-bone ink-shadow will-change-transform sm:text-7xl wide:text-[clamp(1.75rem,4.4vw,5.75rem)]"
            >
              The path
            </h2>

            {/* Demands everything: tracking tightens as the blade leaves the scabbard */}
            <p
              ref={titleDemandsRef}
              className="mt-2 font-mincho text-3xl font-normal leading-tight text-bone ink-shadow sm:text-5xl wide:text-[clamp(1.1rem,2.5vw,3.25rem)]"
            >
              demands everything.
            </p>

            <p ref={subRef} className="lede ink-shadow mt-7">
              As the steel glides from the scabbard, the world narrows. No regret for
              what was behind. No longing for what lies ahead. Only the pure geometry
              of the draw.
            </p>

            {/* Three disciplines of the draw, each marked with a speck of vermilion */}
            <ul
              ref={tagsRef}
              className="note mt-8 flex flex-wrap gap-x-6 gap-y-2 text-bone ink-shadow"
            >
              {["Focus", "Precision", "Zero wasted effort"].map((t) => (
                <li key={t} className="flex items-center gap-2.5 before:h-1 before:w-1 before:bg-shu">
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <Inscription seal="参" kanji="抜刀" reading="Battō" />
        </div>
      </div>
    </section>
  );
}
