"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Inscription, { revealOnEnter, exitOnLeave } from "./Inscription";

export default function StrikeSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slashLineRef = useRef<HTMLDivElement | null>(null);
  const glintRef = useRef<HTMLSpanElement | null>(null);
  const textLeftRef = useRef<HTMLHeadingElement | null>(null);
  const textRightRef = useRef<HTMLHeadingElement | null>(null);
  const subtextRef = useRef<HTMLParagraphElement | null>(null);
  const badgeRef = useRef<HTMLParagraphElement | null>(null);
  const contentWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // How far the two halves part after the cut. Phones get a small split so nothing leaves the screen.
    const wide = window.innerWidth >= 768;
    const partLeft = wide ? 56 : 10;
    const partRight = wide ? 20 : 10;

    const ctx = gsap.context(() => {
      // 1. Initial Entrance of text and badge
      const tl = gsap.timeline({ paused: true });
      revealOnEnter(tl, containerRef.current!);

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

      // 2. The cut: the page's only sharp motion. Once the strike is in frame the blade line crosses the
      // column in 180ms, a glint flares and dies, and the sentence parts along the cut. Scrolling back
      // above it un-cuts, faster (revealOnEnter rewinds at 3x).
      const cut = gsap.timeline({ paused: true });
      revealOnEnter(cut, containerRef.current!, "8% top");
      cut
        .fromTo(slashLineRef.current, { scaleX: 0 }, { scaleX: 1, duration: 0.18, ease: "power4.out" })
        .fromTo(glintRef.current, { opacity: 0 }, { opacity: 1, duration: 0.06, ease: "none" }, 0.1)
        .to(glintRef.current, { opacity: 0, duration: 0.5, ease: "power2.out" })
        .to(textLeftRef.current, { x: -partLeft, duration: 0.6, ease: "power4.out" }, 0.12)
        .to(textRightRef.current, { x: partRight, duration: 0.6, ease: "power4.out" }, 0.12);

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

              {/* The cut: a bone-white blade line, slightly off true like a real slash, with a glint that flares once */}
              <div
                ref={slashLineRef}
                className="relative my-5 h-[2px] w-full origin-left -rotate-[3deg] rounded-full bg-bone shadow-[0_0_14px_rgb(239_231_215/0.55)] will-change-transform"
              >
                <span ref={glintRef} className="absolute -inset-y-2 inset-x-0 rounded-full bg-bone/80 opacity-0 blur-md" />
              </div>

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

            <p ref={badgeRef} className="mt-6 text-sm text-bone/75 ink-shadow">
              <span lang="ja-Latn" className="font-mincho text-base text-bone">Ichigeki hissatsu</span>, one blade, one life
            </p>
          </div>

          <Inscription seal="肆" kanji="一撃" reading="Ichigeki" />
        </div>
      </div>
    </section>
  );
}
