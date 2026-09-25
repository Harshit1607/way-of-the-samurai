"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription, { BRUSH_FROM, BRUSH_TO } from "./Inscription";

export default function HonourSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const line1Ref = useRef<HTMLSpanElement | null>(null);
  const line2Ref = useRef<HTMLSpanElement | null>(null);
  const line3Ref = useRef<HTMLSpanElement | null>(null);
  const subtextRef = useRef<HTMLParagraphElement | null>(null);
  const quoteRef = useRef<HTMLElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Staggered masked reveals as samurai begins moving in background
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      // 0.00s: HONOUR enters from below mask
      tl.fromTo(
        line1Ref.current,
        BRUSH_FROM,
        { ...BRUSH_TO, duration: 1.1, ease: "power2.out" }
      )
        // 0.15s: IS THE FIRST enters
        .fromTo(
          line2Ref.current,
          BRUSH_FROM,
          { ...BRUSH_TO, duration: 1.1, ease: "power2.out" },
          "-=0.9"
        )
        // 0.30s: battle. enters
        .fromTo(
          line3Ref.current,
          BRUSH_FROM,
          { ...BRUSH_TO, duration: 1.1, ease: "power2.out" },
          "-=0.85"
        )
        // 0.50s: Supporting copy appears with smooth slide
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
          "-=0.6"
        )
        .fromTo(
          quoteRef.current,
          { opacity: 0, x: -16 },
          { opacity: 1, x: 0, duration: 1, ease: "power3.out" },
          "-=0.6"
        );

      // Section exit transition: floats upward as Discipline enters
      gsap.to(contentWrapperRef.current, {
        y: -100,
        opacity: 0,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "60% top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[175vh] w-full select-none bg-transparent"
    >
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-end px-6 pb-14 wide:px-[4.5vw] wide:pb-20">
        <div
          ref={contentWrapperRef}
          className="wash relative z-10 flex items-end gap-6 wide:ml-auto wide:w-[36vw] wide:gap-10"
        >
          <div className="min-w-0 flex-1">
            <h2 className="display text-5xl text-bone ink-shadow sm:text-7xl wide:text-[clamp(1.75rem,4.4vw,5.75rem)]">
              <span className="block">
                <span ref={line1Ref} className="block">Honour</span>
              </span>
              <span className="block">
                <span ref={line2Ref} className="block font-normal">is the first</span>
              </span>
              <span className="block">
                <span ref={line3Ref} className="block">battle.</span>
              </span>
            </h2>

            <p ref={subtextRef} className="lede ink-shadow mt-7">
              Discipline begins where comfort ends. The steel remains dormant until
              the soul has chosen its burden. To master the blade, one must first
              master the chaos within.
            </p>

            {/* The chapter's one quotation, hung from a short vermilion rule */}
            <figure ref={quoteRef} className="mt-8 flex gap-4">
              <span className="mt-[0.7em] h-px w-8 shrink-0 bg-shu" />
              <blockquote className="font-mincho text-base leading-relaxed text-bone ink-shadow wide:text-lg">
                &ldquo;A warrior with no honour is merely a blade without a hand.&rdquo;
              </blockquote>
            </figure>
          </div>

          <Inscription seal="壱" kanji="名誉" reading="Meiyo" />
        </div>
      </div>
    </section>
  );
}
