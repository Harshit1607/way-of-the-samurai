"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription from "./Inscription";

export default function StrikeSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slashLineRef = useRef<HTMLDivElement | null>(null);
  const textLeftRef = useRef<HTMLHeadingElement | null>(null);
  const textRightRef = useRef<HTMLHeadingElement | null>(null);
  const subtextRef = useRef<HTMLParagraphElement | null>(null);
  const badgeRef = useRef<HTMLParagraphElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Headlines already span the full width on phones, so drifting them apart would push them off-screen
    const drift = window.innerWidth < 768 ? 0 : 40;

    const ctx = gsap.context(() => {
      // 1. Initial Entrance of text and badge
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        textLeftRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" }
      )
        .fromTo(
          textRightRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power3.out" },
          "-=0.8"
        )
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          "-=0.7"
        )
        .fromTo(
          badgeRef.current,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          "-=0.6"
        );

      // 2. High-Impact Visual Split & Katana Slash choreographed 1:1 with the attack frame:
      // Slicing divider lines open, ONE MOVEMENT drifts left, ONE DECISION drifts right as user scrubs into the strike
      gsap.fromTo(
        slashLineRef.current,
        { scaleX: 0, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "15% top",
            end: "55% top",
            scrub: 0.5,
          },
        }
      );

      gsap.to(textLeftRef.current, {
        x: -drift,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "15% top",
          end: "65% top",
          scrub: true,
        },
      });

      gsap.to(textRightRef.current, {
        x: drift,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "15% top",
          end: "65% top",
          scrub: true,
        },
      });

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
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-center px-6 wide:justify-start wide:px-[4.5vw] wide:pt-20">
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 flex items-start gap-6 wide:ml-auto wide:w-[36vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            {/* The split: the two halves of the sentence part as the blade line opens between them */}
            <div className="relative py-2">
              <h2
                ref={textLeftRef}
                className="display text-5xl text-bone ink-shadow will-change-transform sm:text-7xl wide:text-[clamp(1.5rem,3.6vw,4.75rem)]"
              >
                One movement.
              </h2>

              {/* The cut: a hairline of steel with vermilion at the edge. The answer stays bone: vermilion vanishes into the sun here */}
              <div
                ref={slashLineRef}
                className="my-5 h-[2px] w-full origin-left bg-linear-to-r from-shu via-bone/80 to-transparent will-change-transform"
              />

              <h2
                ref={textRightRef}
                className="display text-right text-5xl font-normal text-bone ink-shadow will-change-transform sm:text-7xl wide:text-[clamp(1.5rem,3.6vw,4.75rem)]"
              >
                One decision.
              </h2>
            </div>

            <p ref={subtextRef} className="lede ink-shadow mt-7">
              The sword does not strike twice. A master commits completely in the
              single instant where intention transcends physical form. The cut was
              decided before the steel caught the light.
            </p>

            <p ref={badgeRef} className="note mt-6 ink-shadow">
              <span lang="ja-Latn" className="text-bone">Ichigeki hissatsu</span> — one blade, one life
            </p>
          </div>

          <Inscription seal="肆" kanji="一撃" reading="Ichigeki" />
        </div>
      </div>
    </section>
  );
}
