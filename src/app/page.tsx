"use client";

import { useState, useCallback } from "react";
import SmoothScroll from "@/components/SmoothScroll";
import Preloader from "@/components/Preloader";
import BackgroundEffects from "@/components/BackgroundEffects";
import SamuraiBackgroundCanvas from "@/components/SamuraiBackgroundCanvas";
import ChapterRail from "@/components/ChapterRail";
import HeroSection from "@/components/HeroSection";
import HonourSection from "@/components/HonourSection";
import DisciplineSection from "@/components/DisciplineSection";
import ThePathSection from "@/components/ThePathSection";
import StrikeSection from "@/components/StrikeSection";
import SilenceSection from "@/components/SilenceSection";
import FinalSection from "@/components/FinalSection";

export default function Home() {
  const [cachedImages, setCachedImages] = useState<HTMLImageElement[]>([]);

  const handleImagesLoaded = useCallback((images: HTMLImageElement[]) => {
    setCachedImages(images);
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-ink text-bone overflow-x-clip">
      {/* Frame Preloading Curtain */}
      <Preloader onLoaded={handleImagesLoaded} />

      {/* Atmospheric Ember and Dust Particles */}
      <BackgroundEffects />

      {/* The Single Persistent Viewport Animation Background (One Continuous Shot with Dual-Frame Interpolation) */}
      <SamuraiBackgroundCanvas cachedImages={cachedImages} />

      {/* Chapter index + progress (landscape only) */}
      <ChapterRail />

      {/* Lenis Smooth Scroll Container with Pure Cinematic Title Overlays */}
      <SmoothScroll>
        <div className="relative z-10 w-full flex flex-col">
          {/* PROLOGUE / HERO */}
          <HeroSection />

          {/* ACT I / HONOUR */}
          <HonourSection />

          {/* ACT II / DISCIPLINE */}
          <DisciplineSection />

          {/* ACT III / THE PATH */}
          <ThePathSection />

          {/* ACT IV / THE STRIKE */}
          <StrikeSection />

          {/* ACT V / SILENCE */}
          <SilenceSection />

          {/* EPILOGUE / FINAL */}
          <FinalSection />
        </div>
      </SmoothScroll>
    </main>
  );
}
