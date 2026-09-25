"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Headline entrance: a brush drawn left to right, ink soaking from soft to sharp.
// Negative insets leave room for the ink-shadow and descenders.
export const BRUSH_FROM = { clipPath: "inset(-20% 100% -20% -5%)", filter: "blur(8px)" };
export const BRUSH_TO = { clipPath: "inset(-20% -10% -20% -5%)", filter: "blur(0px)" };

interface InscriptionProps {
  seal: string; // chapter numeral pressed into the seal
  kanji: string; // vertical inscription
  reading: string; // romanized reading, set as a margin note
  delay?: number; // seconds; the hero waits for the preloader curtain
}

// The chapter mark: a seal stamped above a column of kanji that inks in top to bottom, like a brush
// writing down a hanging scroll. Plays when its chapter scrolls in; every chapter shares this one gesture.
export default function Inscription({ seal, kanji, reading, delay = 0 }: InscriptionProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const sealRef = useRef<HTMLSpanElement | null>(null);
  const inkRef = useRef<HTMLSpanElement | null>(null);
  const readingRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        delay,
        scrollTrigger: {
          trigger: root.closest("section, footer") ?? root,
          start: "top 60%",
          toggleActions: "play none none reverse",
        },
      });

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
    }, root);

    return () => ctx.revert();
  }, [delay]);

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
