"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ArrowUp, X } from "lucide-react";
import Inscription, { BRUSH_FROM, BRUSH_TO } from "./Inscription";

export default function FinalSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleLine1Ref = useRef<HTMLSpanElement | null>(null);
  const titleLine2Ref = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Slow, monumental, and powerful masked reveal over the final completed pose
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        titleLine1Ref.current,
        BRUSH_FROM,
        { ...BRUSH_TO, duration: 1.4, ease: "power2.out" }
      )
        .fromTo(
          titleLine2Ref.current,
          BRUSH_FROM,
          { ...BRUSH_TO, duration: 1.4, ease: "power2.out" },
          "-=1.0"
        )
        .fromTo(
          subRef.current,
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" },
          "-=0.8"
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
          "-=0.7"
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // While the pledge is open: Escape closes it and the film behind it stops scrolling
  useEffect(() => {
    if (!isModalOpen) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsModalOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lenis?.start();
    };
  }, [isModalOpen]);

  const scrollToTop = () => {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (target: number, opts?: Record<string, unknown>) => void } }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { duration: 2.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      ref={containerRef}
      className="relative min-h-[130vh] w-full select-none bg-transparent overflow-clip"
    >
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-between px-6 py-7 wide:px-[4.5vw] wide:py-10">
        {/* Colophon: mirrors the opening masthead */}
        <div className="relative z-10 flex items-center justify-between border-b border-bone/15 pb-5">
          <div className="flex items-center gap-4">
            <span className="seal h-9 w-9 -rotate-2 text-base">道</span>
            <span className="font-mincho text-sm font-bold tracking-wide text-bone ink-shadow">Epilogue</span>
          </div>

          <button
            onClick={scrollToTop}
            className="note group flex cursor-pointer items-center gap-2 py-2 text-bone/80 transition-colors duration-300 hover:text-bone"
          >
            Replay the film
            <ArrowUp className="h-3.5 w-3.5 text-shu transition-transform duration-300 group-hover:-translate-y-0.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Closing statement in the narrow column: he fills most of the frame by now */}
        <div className="wash relative z-10 mt-auto mb-8 flex items-end gap-6 wide:ml-auto wide:w-[30vw] wide:gap-10">
          <div className="min-w-0 flex-1">
            <h2 className="display text-5xl text-bone ink-shadow sm:text-7xl wide:text-[clamp(1.75rem,4vw,5.5rem)]">
              <span className="block">
                <span ref={titleLine1Ref} className="block font-normal">Walk with</span>
              </span>
              <span className="block">
                <span ref={titleLine2Ref} className="block text-shu">honour.</span>
              </span>
            </h2>

            <p ref={subRef} className="lede ink-shadow mt-6">
              The path is forged one step at a time. The discipline never ends.
            </p>

            <div ref={ctaRef} className="mt-9">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group inline-flex cursor-pointer items-center gap-4 rounded-[3px] bg-shu px-7 py-4 font-mincho text-base font-bold tracking-wide text-bone shadow-[0_10px_30px_rgb(8_6_5/0.55)] transition-[background-color,transform] duration-300 ease-out hover:bg-shu-deep active:translate-y-px"
              >
                Enter the path
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <Inscription seal="終" kanji="道" reading="Michi" />
        </div>

        {/* The Warrior's Pledge: an oath set on a sheet of sumi paper, sealed in vermilion.
            Portaled to <body>: inside the z-10 content layer the particles and chapter rail would sit on top of it */}
        {isModalOpen && createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pledge-title"
            onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/85 p-6 animate-[fadeIn_0.3s_ease-out]"
          >
            <div className="relative flex w-full max-w-xl gap-8 rounded-[4px] border border-bone/10 bg-sumi p-8 shadow-[0_30px_80px_rgb(0_0_0/0.6)] wide:p-12">
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                autoFocus
                className="absolute top-5 right-5 cursor-pointer p-1 text-ash transition-colors hover:text-bone"
              >
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>

              <div className="min-w-0 flex-1">
                <p className="note">The warrior&apos;s pledge</p>

                <h3 id="pledge-title" className="display mt-4 text-3xl text-bone wide:text-4xl">
                  I accept the burden of the blade.
                </h3>

                <p className="lede mt-5 text-ash">
                  I commit to walking without shortcut. I recognize that true mastery
                  resides not in the damage inflicted upon the world, but in the
                  discipline enforced upon myself.
                </p>

                <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      scrollToTop();
                    }}
                    className="cursor-pointer rounded-[3px] bg-shu px-6 py-3.5 font-mincho text-sm font-bold tracking-wide text-bone transition-[background-color,transform] duration-300 hover:bg-shu-deep active:translate-y-px"
                  >
                    Seal the oath and begin again
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="cursor-pointer py-3 text-left text-sm text-ash underline decoration-bone/25 underline-offset-4 transition-colors hover:text-bone hover:decoration-bone"
                  >
                    Return to silence
                  </button>
                </div>
              </div>

              <div aria-hidden="true" className="hidden flex-col items-center gap-4 sm:flex">
                <span className="seal h-12 w-12 -rotate-3 text-2xl">誓</span>
                <span className="tategaki text-xl font-bold text-bone/70">武士の誓い</span>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </footer>
  );
}
