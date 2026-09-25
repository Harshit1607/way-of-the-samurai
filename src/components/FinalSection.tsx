"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, ArrowUp, X } from "lucide-react";
import Inscription, { BRUSH_FROM, BRUSH_TO, revealOnEnter } from "./Inscription";

type LenisLike = {
  stop: () => void;
  start: () => void;
  scrollTo: (target: number, opts?: Record<string, unknown>) => void;
};
const getLenis = () => (window as unknown as { __lenis?: LenisLike }).__lenis;

export default function FinalSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const titleLine1Ref = useRef<HTMLSpanElement | null>(null);
  const titleLine2Ref = useRef<HTMLSpanElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const sealRef = useRef<HTMLSpanElement | null>(null);
  const [sealed, setSealed] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Slow, monumental, and powerful masked reveal over the final completed pose
      const tl = gsap.timeline({ paused: true });
      revealOnEnter(tl, containerRef.current!);

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

  // The pledge is a native modal <dialog>: focus trap, Esc and focus return come from the browser.
  // While it's open the film behind it stops scrolling.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => getLenis()?.start();
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, []);

  const openPledge = () => {
    setSealed(false);
    getLenis()?.stop();
    dialogRef.current?.showModal();
  };

  const closePledge = () => dialogRef.current?.close();

  // The one act of commitment on the page gets its moment: the seal is pressed, held, then the film rewinds
  const sealOath = () => {
    if (sealed) return;
    setSealed(true);
    gsap.fromTo(
      sealRef.current,
      { scale: 1.4, rotate: -9, opacity: 0 },
      { scale: 1, rotate: -3, opacity: 1, duration: 0.45, ease: "power4.out" }
    );
    setTimeout(() => {
      closePledge();
      scrollToTop();
    }, 900);
  };

  const scrollToTop = () => {
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { duration: 2.2 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer
      ref={containerRef}
      className="relative min-h-[130vh] w-full bg-transparent overflow-clip"
    >
      <div className="sticky top-0 flex h-dvh w-full flex-col justify-between px-6 py-7 wide:px-[4.5vw] wide:py-10">
        {/* Colophon: mirrors the opening masthead */}
        <div className="relative z-10 flex items-center justify-between border-b border-bone/15 pb-5">
          <span className="font-mincho text-sm font-bold tracking-wide text-bone ink-shadow">Epilogue</span>

          <button
            onClick={scrollToTop}
            className="note group -mr-2 flex min-h-11 cursor-pointer items-center gap-2 px-2 text-bone/80 transition-[color,scale] duration-150 ease-snap hover:text-bone active:scale-[0.97]"
          >
            Replay the film
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-200 ease-snap group-hover:-translate-y-0.5" strokeWidth={1.5} />
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
                onClick={openPledge}
                aria-haspopup="dialog"
                className="group inline-flex min-h-14 cursor-pointer items-center gap-4 rounded-[3px] bg-shu-deep px-7 font-mincho text-base font-bold tracking-wide text-bone shadow-[0_10px_30px_rgb(8_6_5/0.55)] transition-[background-color,scale] duration-150 ease-snap hover:bg-shu-dark active:scale-[0.97]"
              >
                Enter the path
                <ArrowUpRight className="h-4 w-4 transition-transform duration-200 ease-snap group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <Inscription seal="終" kanji="道" reading="Michi" />
        </div>

        {/* The Warrior's Pledge: an oath on a sheet of sumi paper. The seal stays blank until the reader
            commits, then it is pressed in vermilion. A native dialog renders in the top layer, above everything. */}
        <dialog
          ref={dialogRef}
          aria-labelledby="pledge-title"
          onClick={(e) => e.target === e.currentTarget && closePledge()}
          className="pledge m-auto w-[min(36rem,calc(100%-2rem))] max-w-none overflow-visible rounded-[4px] border border-bone/10 bg-sumi p-0 text-bone shadow-[0_30px_80px_rgb(0_0_0/0.6)]"
        >
          <div className="relative flex gap-5 p-6 sm:gap-8 sm:p-8 wide:p-12">
            <button
              onClick={closePledge}
              aria-label="Close"
              className="absolute top-2 right-2 grid size-11 cursor-pointer place-items-center text-ash transition-[color,scale] duration-150 ease-snap hover:text-bone active:scale-[0.92]"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="note">The warrior&apos;s pledge</p>

              <h3 id="pledge-title" className="display mt-4 pr-6 text-3xl text-bone wide:text-4xl">
                I accept the burden of the blade.
              </h3>

              <p className="lede mt-5 text-ash">
                I commit to walking without shortcut. I recognize that true mastery
                resides not in the damage inflicted upon the world, but in the
                discipline enforced upon myself.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                <button
                  onClick={sealOath}
                  disabled={sealed}
                  className="min-h-12 cursor-pointer rounded-[3px] bg-shu-deep px-6 font-mincho text-sm font-bold tracking-wide text-bone transition-[background-color,scale] duration-150 ease-snap hover:bg-shu-dark active:scale-[0.97] disabled:cursor-default"
                >
                  {sealed ? "Sealed" : "Seal the oath and begin again"}
                </button>
                <button
                  onClick={closePledge}
                  disabled={sealed}
                  className="min-h-11 cursor-pointer text-left text-sm text-ash underline decoration-bone/25 underline-offset-4 transition-colors duration-150 hover:text-bone hover:decoration-bone disabled:opacity-40"
                >
                  Return to silence
                </button>
              </div>
            </div>

            <div aria-hidden="true" className="flex flex-col items-center gap-4 pt-12">
              {/* Blank impression until the oath is sealed */}
              <span className="relative grid h-12 w-12 place-items-center">
                <span className="absolute inset-0 -rotate-3 rounded-[3px] border border-dashed border-bone/25" />
                <span ref={sealRef} className={`seal absolute inset-0 -rotate-3 text-2xl ${sealed ? "" : "opacity-0"}`}>
                  誓
                </span>
              </span>
              <span className="tategaki hidden text-xl font-bold text-bone/70 sm:block">武士の誓い</span>
            </div>
          </div>
        </dialog>
      </div>
    </footer>
  );
}
