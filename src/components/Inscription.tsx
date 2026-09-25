"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Headline entrance: a brush drawn left to right, ink soaking from soft to sharp.
// Negative insets leave room for the ink-shadow and descenders.
export const BRUSH_FROM = { clipPath: "inset(-20% 100% -20% -5%)", filter: "blur(3px)" };
export const BRUSH_TO = { clipPath: "inset(-20% -10% -20% -5%)", filter: "blur(0px)" };

// A chapter's entrance plays forward when it scrolls in, and rewinds 3x faster when the reader
// scrolls back above it: exits are quicker than entrances, so scrubbing back never feels sluggish.
export function revealOnEnter(tl: gsap.core.Timeline, trigger: Element, start = "top 60%") {
  return ScrollTrigger.create({
    trigger,
    start,
    onEnter: () => tl.timeScale(1).play(),
    onLeaveBack: () => tl.timeScale(3).reverse(),
  });
}

// A chapter's exit: fades and lifts, finished (62% of its track) before the next chapter's
// entrance fires at "top 60%", so two chapters never share the column. Linear: it rides the playhead.
export function exitOnLeave(target: Element | null, trigger: Element | null) {
  return gsap.to(target, {
    y: -40,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger, start: "35% top", end: "62% top", scrub: true },
  });
}

// The hero waits for the preloader curtain so its title never plays unseen behind it.
export function onCurtainLift(cb: () => void) {
  const w = window as unknown as { __curtainLifted?: boolean };
  if (w.__curtainLifted) {
    cb();
    return () => {};
  }
  window.addEventListener("curtain-lift", cb, { once: true });
  return () => window.removeEventListener("curtain-lift", cb);
}

interface InscriptionProps {
  seal: string; // chapter numeral pressed into the seal
  kanji: string; // vertical inscription
  reading: string; // romanized reading, set as a margin note
  onCurtain?: boolean; // the hero plays when the preloader lifts instead of on scroll
}

// The chapter mark: a seal stamped above a column of kanji that inks in top to bottom, like a brush
// writing down a hanging scroll. Plays when its chapter scrolls in; every chapter shares this one gesture.
export default function Inscription({ seal, kanji, reading, onCurtain = false }: InscriptionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLSpanElement | null>(null);
  const inkRef = useRef<HTMLSpanElement | null>(null);
  const readingRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    let offCurtain = () => {};
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(
        sealRef.current,
        { opacity: 0, scale: 1.35, rotate: -6 },
        { opacity: 1, scale: 1, rotate: -2, duration: 0.45, ease: "power4.out" }
      )
        .fromTo(
          inkRef.current,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power2.inOut" },
          "-=0.1"
        )
        .fromTo(readingRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, "-=0.6");

      if (onCurtain) offCurtain = onCurtainLift(() => tl.delay(0.8).play());
      else revealOnEnter(tl, root.closest("section, footer") ?? root);
    }, root);

    return () => {
      offCurtain();
      ctx.revert();
    };
  }, [onCurtain]);

  return (
    <div ref={rootRef} aria-hidden="true" className="flex shrink-0 flex-col items-center gap-4">
      <span ref={sealRef} className="seal h-10 w-10 text-lg wide:h-12 wide:w-12 wide:text-xl">
        {seal}
      </span>
      <span
        ref={inkRef}
        className="tategaki ink-shadow text-2xl font-bold text-bone wide:text-[clamp(1.5rem,2.2vw,2.5rem)]"
      >
        {kanji}
      </span>
      <span ref={readingRef} className="note tategaki font-gothic tracking-[0.3em]">
        {reading}
      </span>
    </div>
  );
}
