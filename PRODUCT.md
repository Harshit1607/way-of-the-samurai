# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Visitors who scroll a single cinematic page. They are here to watch, not to operate: the scroll is the playhead of one unbroken 25-second shot of a samurai.

## Product Purpose

"The Way of the Samurai // Tanjo — Vol. 1": a continuous scroll film. 1,520 frames scrub under the page while seven chapters of text (Prologue, Honour, Discipline, The Path, The Strike, Silence, Epilogue) narrate honour, discipline, precision and silence. Success means the film stays the hero and the words read as its inscriptions.

## Capabilities and Constraints

- The background frame film (`SamuraiBackgroundCanvas`, frames in `public/frames_webp`) and the ember particle layer (`BackgroundEffects`) are fixed. Do not change them.
- Preloader loading logic (first 100 frames eager, rest streamed) is fixed; its visuals are free.
- The samurai stays left of center and grows through the shot. In landscape, copy lives in a right-hand column; in portrait, a bottom band. See `CONTENT_AND_LAYOUT.md`.
- Stack: Next.js 16, Tailwind v4, GSAP ScrollTrigger, Lenis.

## Brand Commitments

- Name: The Jade Samurai, Chronicles Vol. 1, Kyoto 1642. Emblem kanji 七.
- Copy is the incumbent chapter text; keep its meaning.

## Evidence on Hand

- Film frames: `public/frames_webp/` (1600×900, red ink-wash painting, red sun upper right).
- No testimonials, press or data. Do not invent any.
