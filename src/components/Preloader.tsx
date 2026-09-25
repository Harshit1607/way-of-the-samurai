"use client";

import { useEffect, useState, useRef } from "react";
import framesList from "../../public/frames.json";

// Frames live off-site in production (e.g. a GitHub Pages repo); locally they're served from /public
const FRAMES_URL = (process.env.NEXT_PUBLIC_FRAMES_URL ?? "/frames_webp").replace(/\/$/, "");

interface PreloaderProps {
  onLoaded: (cachedImages: HTMLImageElement[]) => void;
}

export default function Preloader({ onLoaded }: PreloaderProps) {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [hasStartedTransition, setHasStartedTransition] = useState(false);
  const onLoadedRef = useRef(onLoaded);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  });

  useEffect(() => {
    let loadedCount = 0;
    const totalFrames = framesList.length;
    const images: HTMLImageElement[] = new Array(totalFrames);

    // Initial batch: First 100 frames for instant entry without blocking the UI
    const INITIAL_THRESHOLD = Math.min(100, totalFrames);
    let isTransitionTriggered = false;

    const triggerCompletion = () => {
      if (isTransitionTriggered) return;
      isTransitionTriggered = true;
      setHasStartedTransition(true);
      // The hero title waits for this so it plays in view, not behind the curtain
      (window as unknown as { __curtainLifted?: boolean }).__curtainLifted = true;
      window.dispatchEvent(new Event("curtain-lift"));
      setTimeout(() => {
        setIsDone(true);
      }, 700);
    };

    const onFrameLoad = () => {
      loadedCount++;
      const readyPct = Math.min(
        100,
        Math.floor((loadedCount / INITIAL_THRESHOLD) * 100)
      );
      setProgress(readyPct);

      if (loadedCount >= INITIAL_THRESHOLD && !isTransitionTriggered) {
        setTimeout(triggerCompletion, 200);
      }
    };

    // 1. Immediately request the opening sequence
    for (let i = 0; i < INITIAL_THRESHOLD; i++) {
      const img = new Image();
      img.src = `${FRAMES_URL}/${framesList[i]}`;
      img.onload = onFrameLoad;
      img.onerror = onFrameLoad;
      images[i] = img;
    }

    // 2. Stream all remaining frames in steady concurrent background batches
    let nextIndex = INITIAL_THRESHOLD;
    const BATCH_SIZE = 30;

    const streamNextBatch = () => {
      if (nextIndex >= totalFrames) return;
      const end = Math.min(totalFrames, nextIndex + BATCH_SIZE);
      for (let i = nextIndex; i < end; i++) {
        const img = new Image();
        img.src = `${FRAMES_URL}/${framesList[i]}`;
        img.onload = () => {
          loadedCount++;
        };
        img.onerror = () => {
          loadedCount++;
        };
        images[i] = img;
      }
      nextIndex = end;
      if (nextIndex < totalFrames) {
        setTimeout(streamNextBatch, 40);
      }
    };

    // Kick off continuous background stream
    const streamTimer = setTimeout(streamNextBatch, 200);

    // Share image reference array with canvas immediately
    onLoadedRef.current?.(images);

    // Safety timeout
    const timeout = setTimeout(() => {
      triggerCompletion();
    }, 4500);

    return () => {
      clearTimeout(timeout);
      clearTimeout(streamTimer);
    };
  }, []);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-ink transition-[opacity,translate] duration-700 ease-curtain select-none ${
        hasStartedTransition ? "pointer-events-none -translate-y-full opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex items-start gap-10">
        {/* The title is brushed down the column as the opening frames arrive */}
        <div className="relative">
          <span className="tategaki block text-5xl font-bold text-bone/10">武士道</span>
          <span
            aria-hidden="true"
            className="tategaki absolute inset-0 block text-5xl font-bold text-bone transition-[clip-path] duration-200 ease-out"
            style={{ clipPath: `inset(0% 0% ${100 - progress}% 0%)` }}
          >
            武士道
          </span>
        </div>

        <div className="flex flex-col gap-6 pt-1">
          <span
            className={`seal h-12 w-12 text-2xl transition-[opacity,transform] duration-300 ease-out ${
              progress >= 100 ? "-rotate-3 scale-100 opacity-100" : "scale-125 opacity-0"
            }`}
          >
            七
          </span>
          <div className="flex flex-col gap-2">
            <span className="font-mincho text-lg font-bold text-bone">Honour has no shortcut</span>
            <span className="note">The Jade Samurai · vol. 1</span>
          </div>
          {/* One announcement for screen readers instead of a digit per frame */}
          <span role="status" className="sr-only">
            {progress >= 100 ? "The film is ready" : "Loading the film"}
          </span>
          <span aria-hidden="true" className="note tabular-nums text-bone">
            {progress.toString().padStart(3, "0")}
            <span className="text-ash"> / 100</span>
          </span>
        </div>
      </div>
    </div>
  );
}
