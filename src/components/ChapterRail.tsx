"use client";

import { useEffect, useRef, useState } from "react";

// Chapter numerals match the seals pressed in each section
const CHAPTERS = [
  { mark: "序", label: "Prologue" },
  { mark: "壱", label: "Honour" },
  { mark: "弐", label: "Discipline" },
  { mark: "参", label: "The path" },
  { mark: "肆", label: "The strike" },
  { mark: "伍", label: "Silence" },
  { mark: "終", label: "Epilogue" },
];

type LenisLike = { scrollTo: (target: HTMLElement, opts?: Record<string, unknown>) => void };

// Sections in page order: the 6 <section>s plus the closing <footer>
const getSections = () =>
  Array.from(document.querySelectorAll<HTMLElement>("main section, main footer"));

export default function ChapterRail() {
  const [active, setActive] = useState(0);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = (e: Event) => {
      const { progress: p, scroll } = (e as CustomEvent<{ progress: number; scroll: number }>).detail;
      // Per-frame value: write straight to the DOM instead of re-rendering
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${p})`;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      const mid = scroll + window.innerHeight * 0.5;
      const idx = getSections().filter((s) => s.offsetTop <= mid).length - 1;
      setActive(Math.max(0, idx));
    };
    window.addEventListener("lenis-scroll", onScroll);
    return () => window.removeEventListener("lenis-scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const target = getSections()[i];
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (!target) return;
    // Travel time scales with distance: one chapter is a short glide, six is the full 2.4s
    const duration = Math.min(2.4, Math.max(0.9, Math.abs(i - active) * 0.45));
    if (lenis) lenis.scrollTo(target, { duration });
    else target.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
    {/* Portrait has no rail, so a hairline across the top carries the progress */}
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[2px] bg-bone/10 wide:hidden">
      <div ref={barRef} className="h-full w-full origin-left bg-bone/70" style={{ transform: "scaleX(0)" }} />
    </div>

    <nav
      aria-label="Chapters"
      className="fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 wide:block"
    >
      {/* Progress spine: vermilion ink runs down the hairline as the film plays */}
      <div className="absolute left-[13px] top-[22px] bottom-[22px] w-px bg-bone/15">
        <div ref={fillRef} className="h-full w-full origin-top bg-shu" style={{ transform: "scaleY(0)" }} />
      </div>

      <ol className="relative flex flex-col">
        {CHAPTERS.map(({ mark, label }, i) => (
          <li key={label}>
            <button
              onClick={() => goTo(i)}
              aria-current={i === active ? "step" : undefined}
              aria-label={label}
              className="group flex min-h-11 cursor-pointer items-center gap-3"
            >
              <span
                className={`flex h-[27px] w-[27px] items-center justify-center rounded-[2px] font-mincho text-[13px] font-bold transition-[background-color,color,rotate,scale] duration-200 ease-snap group-active:scale-[0.92] ${
                  i === active
                    ? "-rotate-3 bg-bone text-ink"
                    : "bg-ink/70 text-bone/55 group-hover:text-bone"
                }`}
              >
                {mark}
              </span>
              <span
                className={`note ink-shadow text-bone transition-[opacity,translate] duration-200 ease-snap ${
                  i === active
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-70 group-focus-visible:opacity-70"
                }`}
              >
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
    </>
  );
}
