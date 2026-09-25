# THE WAY OF THE SAMURAI — Text & Placement Architecture

A comprehensive documentation of all textual content, typographic hierarchy, visual positioning, and scroll-linked choreographies across every section of the page.

---

## Global System & Theme Tokens

- **Background Void**: `#050505`
- **Text Primary (Bone)**: `#f5f0e6` — Primary reading text, default for all body copy and most headline text. (0% pure `#ffffff` policy).
- **Text Secondary (Ash)**: `#9c9489` — Secondary metadata, timestamps, frame counters, section tags.
- **Text Muted (Dim)**: `#5c564f` — Micro technical counters and secondary labels.
- **Samurai Red**: `#d32020` — Reserved strictly for moments of consequence ("SAMURAI", "BATTLE", "SILENCE", "HONOUR", strike divider flash, live indicators).
- **Samurai Gold**: `#c5a059` — Reserved for turning points, emphasis words, subtitle conclusions, tag pills.
- **Samurai Jade**: `#236d5f` — Act III chapter signature and sword-draw gradient accent.
- **Typography Families**:
  - `font-cinzel` (`Cinzel`, Serif): Display headlines ONLY (the big multi-line monumental statements — "voice of the film").
  - `font-mono` / `font-space` (`Space Grotesk`, Mono/Sans): Metadata, tags, chapter labels, body reflections, subtitles ("voice of the archive").
  - `font-bebas` (`Bebas Neue`, Sans): Display numerals / condensed counters only.
- **Silhouette & Negative Space Rule** (verified against frames 1–1520 at 1920×1080 and 1440×900):
  - The camera pushes in on the samurai throughout the shot. He grows from about 15% of the frame width (prologue) to about 75% (epilogue), always anchored left-of-center. The red sun sits upper-right, and from Act III onward the drawn blade sweeps across the lower-right.
  - In any landscape viewport (`wide:` variant = aspect ≥ 6/5 and ≥ 560px wide, defined in globals.css), all copy lives in a **right-hand column** with left-aligned text (`md:ml-auto md:w-[34vw]`: 26–36vw depending on how much of the frame he fills). Headlines use `vw`-based `clamp()` sizes so the column never grows into him.
    - Prologue, I, II, V: bottom-right.
    - III (The Path) and IV (The Strike): top-right (`md:pt-24`), above the blade.
    - Epilogue: narrower column (`30vw`), because he fills about 75% of the frame.
  - Portrait: `object-cover` crops to the center strip, where he always is. Copy stays in a bottom band over a bottom gradient scrim.
  - Scrims live in `SamuraiBackgroundCanvas`: a right-edge gradient on desktop and a bottom gradient on mobile.
- **Legibility Treatment**:
  - `.text-cinematic-glow` (`text-shadow: 0 4px 25px rgba(0, 0, 0, 0.95), 0 0 40px rgba(0, 0, 0, 0.8)`) applied across all text nodes over the live video canvas.

---

## 1. Frame Preloader Curtain

> **Component**: [src/components/Preloader.tsx](file:///c:/Vs%20Code/Scroll/src/components/Preloader.tsx)  
> **Layout**: Fixed full-screen overlay (`fixed inset-0 z-50 flex flex-col items-center justify-center`).  
> **Motion**: Fades out and translates upward (`-translate-y-full opacity-0 duration-700`) once the initial 100 frames are decoded.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **七** | Inside central emblem box (`h-20 w-20`) in viewport center | `font-cinzel text-3xl font-bold text-[#d32020]` | Static emblem surrounded by dashed rotating border ring (`animate-[spin_20s_linear_infinite]`) |
| **Tanjo // The Jade Samurai** | Below the emblem box, centered | `font-mono text-[11px] uppercase tracking-[0.4em] text-[#9c9489]` | Static ambient label |
| **HONOUR HAS NO SHORTCUT** | Directly below emblem subtitle | `font-cinzel text-xl font-semibold tracking-[0.25em] text-[#f5f0e6]` | Static title |
| **PRELOADING 60FPS SEQUENCE** | Above progress bar, left-aligned | `font-mono text-[10px] tracking-widest text-[#9c9489]` | Fixed label |
| **000%** $\rightarrow$ **100%** | Above progress bar, right-aligned | `font-mono text-[10px] tracking-widest text-[#d32020] font-semibold` | Real-time numeric progress counter (single red accent on screen) |
| **1520 ULTRA-HD 60FPS FRAMES** | Below progress bar, bottom-left | `font-mono text-[9px] uppercase tracking-[0.25em] text-[#5c564f]` | Metadata counter |
| **16MS MICRO-STEP SEQUENCE** | Below progress bar, bottom-right | `font-mono text-[9px] uppercase tracking-[0.25em] text-[#5c564f]` | Metadata counter |

---

## 2. Prologue / Hero Section

> **Component**: [src/components/HeroSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/HeroSection.tsx)  
> **Layout**: `min-h-[160vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col justify-between px-6 py-8 md:px-16 md:py-12`.  
> **Negative Space**: Header sits in the upper sky band; title cluster sits in the **lower-left** (`mt-auto mb-12 md:mb-16 max-w-3xl`), completely clearing the samurai's silhouette and the upper-right red sun.  
> **Motion**: Staggered clip-path masked reveals sliding up from bottom boundary; scrubbed exit floats upward (`y: -100, opacity: 0`) between 60% and 100% of the section scroll.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **七** | Top-left header badge (`h-9 w-9`) | `font-cinzel text-sm font-bold text-[#d32020]` | Fades and slides down from `y: -25` on mount |
| **CHRONICLES // VOL. 1** | Top-left header, beside emblem (top line) | `font-mono text-[10px] tracking-[0.3em] uppercase text-[#9c9489]` | Mounted alongside emblem badge |
| **THE JADE SAMURAI** | Top-left header, beside emblem (bottom line) | `font-cinzel text-xs font-semibold tracking-wider text-[#f5f0e6]` | Mounted alongside emblem badge |
| **PROLOGUE • 25S CINEMATIC SHOT • KYOTO 1642** | Top-right header pill container | `font-mono text-[10px] tracking-[0.25em] text-[#9c9489]`, with `#c5a059` and `#d32020` accents | Desktop pill with backdrop blur (`bg-black/40 border-[#f5f0e6]/10`) |
| **THE WAY OF** | Lower-left main display title (Line 1) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-[1.02]` | Masked clip-reveal sliding up from `yPercent: 120` to `0` |
| **THE SAMURAI** | Lower-left main display title (Line 2) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#c5a059] leading-[1.02]` (Gold) | Masked clip-reveal sliding up after Line 1 (only headline where Gold carries a full line) |
| **Honour · Discipline · Precision** | Directly beneath display title | `font-mono text-xs sm:text-base font-semibold uppercase text-[#c5a059]` | Letter-spacing compression animation (`0.65em` $\rightarrow$ `0.3em` lens focus) |
| **The warrior rests in absolute stillness. As you scroll, the camera never cuts. Watch the unbroken sequence unfold beneath your fingertips.** | Beneath subtitle, max width `max-w-lg` | `font-mono text-xs sm:text-sm text-[#f5f0e6]/80 font-normal leading-relaxed` | Fades in and slides up (`y: 20` $\rightarrow$ `0`) |

---

## 3. Act I // The First Battle (Honour)

> **Component**: [src/components/HonourSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/HonourSection.tsx)  
> **Layout**: `min-h-[175vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col justify-end pb-14 md:pb-20 px-6 md:px-20`.  
> **Negative Space**: Stacked lower-left (`max-w-3xl`) clear of the samurai's chest and sun disc.  
> **Motion**: Triggered when section reaches `top 60%`. Sequential masked lines reveal one after another; floats upward (`y: -100, opacity: 0`) as user enters Act II.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **ACT I // THE FIRST BATTLE** | Top of content block with 48px Red line | `font-mono text-xs uppercase tracking-[0.35em] text-[#d32020]` | Sits beside a 48px red accent bar (`h-[1px] w-12 bg-[#d32020]`) |
| **HONOUR** | Lower-left stacked heading (Line 1) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-[1.02]` | Masked reveal from `yPercent: 120` $\rightarrow$ `0` |
| **IS THE FIRST** | Lower-left stacked heading (Line 2) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-[1.02]` | Masked reveal starting 0.15s after Line 1 |
| **BATTLE.** | Lower-left stacked heading (Line 3) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#c5a059] leading-[1.02]` (Gold) | Masked reveal starting 0.30s after Line 1 (Gold accent punch word) |
| **Discipline begins where comfort ends. The steel remains dormant until the soul has chosen its burden. To master the blade, one must first master the chaos within.** | Beneath stacked heading, max width `max-w-xl` | `font-mono text-xs sm:text-base uppercase tracking-[0.25em] text-[#f5f0e6]/90 leading-relaxed` | Fades in and slides up (`y: 30` $\rightarrow$ `0`) |
| **“A warrior with no honour is merely a blade without a hand.”** | Floating pill container below narrative copy | `font-cinzel italic text-xs sm:text-sm text-[#c5a059] tracking-wider` | Pill with pulsing red indicator (`animate-pulse`) scaling from `0.95` $\rightarrow$ `1.0` |

---

## 4. Act II // Preparation (Discipline)

> **Component**: [src/components/DisciplineSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/DisciplineSection.tsx)  
> **Layout**: `min-h-[175vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col justify-end pb-14 md:pb-20 px-6 md:px-20`.  
> **Negative Space**: Stacked lower-left (`max-w-3xl`) to mirror the samurai settling symmetrically into his stance.  
> **Motion**: Opposing horizontal cross-entrance: primary headline glides in from the LEFT, secondary line glides in from the RIGHT.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **ACT II // PREPARATION** | Top of content block with 48px Gold line | `font-mono text-xs uppercase tracking-[0.35em] text-[#c5a059]` | Preceded by a 48px gold accent bar (`h-[1px] w-12 bg-[#c5a059]`) |
| **DISCIPLINE** | Primary title | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-none` | Glides in from the **left** (`x: -120` $\rightarrow$ `0`, `opacity: 0` $\rightarrow$ `1`) |
| **MASTER THE MIND BEFORE THE BLADE.** | Secondary title beneath "DISCIPLINE" | `font-cinzel text-xl sm:text-3xl md:text-4xl font-semibold tracking-wide text-[#c5a059] uppercase` (Gold) | Glides in from the **right** (`x: 120` $\rightarrow$ `0`, `opacity: 0` $\rightarrow$ `1`) |
| **Ten thousand repetitions before the cut becomes involuntary. Power unanchored by discipline is merely reckless violence. True strength is the absolute command of stillness.** | Below titles, max width `max-w-xl` | `font-mono text-xs sm:text-sm uppercase tracking-[0.25em] text-[#f5f0e6]/90 leading-relaxed` | Fades in smoothly from `y: 30` $\rightarrow$ `0` |

---

## 5. Act III // The Draw (The Path)

> **Component**: [src/components/ThePathSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/ThePathSection.tsx)  
> **Layout**: `min-h-[175vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col justify-end pb-14 md:pb-20 px-6 md:px-20`.  
> **Negative Space**: Lower-left (`max-w-3xl`).  
> **Motion**: **1:1 Scroll-Scrubbed Katana Draw Synchronization** (`scrub: 0.8`). As the user scrubs through the draw, the title scale and letter-spacing are locked to the scrollbar.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **ACT III // THE DRAW** | Top of content block with 48px Jade line | `font-mono text-xs uppercase tracking-[0.35em] text-[#236d5f]` | Preceded by a 48px jade accent bar (`h-[1px] w-12 bg-[#236d5f]`) |
| **THE PATH** | Upper display title | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-none origin-left` | **1:1 Scroll-Scrubbed scale** (`scale: 0.85` $\rightarrow$ `1.0`, `y: 35` $\rightarrow$ `0`) |
| **DEMANDS EVERYTHING.** | Lower display title | `font-cinzel text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#236d5f] via-[#c5a059] to-[#f5f0e6] leading-none` | **1:1 Scroll-Scrubbed letter-spacing contraction** (`0.45em` $\rightarrow$ `0.08em` blade catch light) |
| **As the steel glides from the scabbard, the world narrows. No regret for what was behind. No longing for what lies ahead. Only the pure geometry of the draw.** | Below title, max width `max-w-xl` | `font-mono text-xs sm:text-base uppercase tracking-[0.25em] text-[#f5f0e6]/90 leading-relaxed` | Fades in and slides up (`y: 25` $\rightarrow$ `0`) |
| **FOCUS** | Bottom HUD tag pill 1 | `font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e6] rounded-full border border-[#f5f0e6]/10 bg-black/40 px-5 py-2` | Fades in with scale (`0.95` $\rightarrow$ `1.0`) |
| **•** | Divider between tag pills | `text-[#d32020]` | Red punctuation separator |
| **PRECISION** | Bottom HUD tag pill 2 | `font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e6] rounded-full border border-[#f5f0e6]/10 bg-black/40 px-5 py-2` | Fades in with scale (`0.95` $\rightarrow$ `1.0`) |
| **•** | Divider between tag pills | `text-[#d32020]` | Red punctuation separator |
| **ZERO WASTED EFFORT** | Bottom HUD tag pill 3 | `font-mono text-xs tracking-[0.3em] uppercase text-[#f5f0e6] rounded-full border border-[#f5f0e6]/10 bg-black/40 px-5 py-2` | Fades in with scale (`0.95` $\rightarrow$ `1.0`) |

---

## 6. Act IV // The Apex (The Strike)

> **Component**: [src/components/StrikeSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/StrikeSection.tsx)  
> **Layout**: `min-h-[175vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col justify-center px-6 md:px-20`.  
> **Motion**: **High-Impact Visual Split & Katana Slash** scrubbed 1:1 across 15% to 55% scroll position. "ONE MOVEMENT." drifts left, "ONE DECISION." in full Red drifts right, as the glowing blade flash expands between them (`scaleX: 0 -> 1`).

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **ACT IV // THE APEX** | Top of content block with 48px Red line | `font-mono text-xs uppercase tracking-[0.35em] text-[#d32020]` | Preceded by a 48px red accent bar (`h-[1px] w-12 bg-[#d32020]`) |
| **ONE MOVEMENT.** | Upper title, aligned left | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-none` | Enters from `y: 50`. **Drifts further LEFT (`x: -65`)** as user scrubs into the strike |
| *(Visual Divider)* | Centered between the two phrases | `h-[2px] w-full bg-gradient-to-r from-[#d32020] via-[#c5a059] to-transparent shadow-[0_0_30px_rgba(211,32,32,0.9)]` | Rapid blade slice expand (`scaleX: 0` $\rightarrow$ `1` scrubbed) |
| **ONE DECISION.** | Lower title, aligned right | `text-right font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#d32020] leading-none` (Samurai Red) | Enters from `y: 50`. **Drifts further RIGHT (`x: +65`)** as user scrubs into the strike (loudest red on page) |
| **The sword does not strike twice. A master commits completely in the single instant where intention transcends physical form. The cut was decided before the steel caught the light.** | Bottom-left narrative block, max width `max-w-xl` | `font-mono text-xs sm:text-base uppercase tracking-[0.25em] text-[#f5f0e6]/90 leading-relaxed` | Fades in and slides up (`y: 30` $\rightarrow$ `0`) |
| **ICHIGEKI HISSATSU // ONE BLADE, ONE LIFE** | Bottom-right footnote pill | `font-mono text-[10px] uppercase tracking-[0.3em] text-[#c5a059] bg-black/40 px-5 py-2.5 rounded-full border border-[#f5f0e6]/10` | Fades in with scale (`0.95` $\rightarrow$ `1.0`) |

---

## 7. Act V // The Void (Silence)

> **Component**: [src/components/SilenceSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/SilenceSection.tsx)  
> **Layout**: `min-h-[175vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col items-center justify-center px-6 text-center`.  
> **Negative Space**: **Sole fully centered section** on the site, reflecting the stillness after violence.  
> **Motion**: Slowest easing curve on the site (2.2–2.6s, `expo.out`). Central Zen Enso circle ring pulses subliminally behind text.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| *(Ambient Enso)* | Center of the screen, behind text | `h-72 w-72 md:h-96 md:w-96 rounded-full border border-[#f5f0e6]/10 shadow-[0_0_90px_rgba(245,240,230,0.03)]` | Perpetual breathing pulse (`scale: 1.08, opacity: 0.35, duration: 4.5s, yoyo: true`) |
| **静寂 // THE VOID (MU)** | Centered above main text block | `font-mono text-xs font-semibold tracking-[0.5em] text-[#c5a059] uppercase` | Centered top signature watermark |
| **AFTER THE STRIKE,** | Center display title (Line 1) | `font-cinzel text-3xl sm:text-5xl md:text-7xl font-light text-[#f5f0e6] leading-tight` | Slow deliberate reveal (`duration: 2.2s`, `letterSpacing: 0.2em` $\rightarrow$ `0.05em`) |
| **SILENCE.** | Center display title (Line 2) | `font-cinzel text-5xl sm:text-7xl md:text-9xl font-bold tracking-wider text-[#d32020]` (Red) | Expansive scale and fade (`duration: 2.6s`, `scale: 0.92` $\rightarrow$ `1.0`, largest Red on site) |
| **Not the absence of sound, but the stillness of the mind. The world fades until nothing remains except absolute clarity.** | Centered paragraph, max width `max-w-xl` | `font-mono text-xs sm:text-base uppercase tracking-[0.3em] text-[#f5f0e6]/90 leading-relaxed` | Fades in and slides up (`y: 20` $\rightarrow$ `0`) |
| **MUSHIN • NO-MIND • FUDOSHIN** | Centered pill badge below paragraph | `font-mono text-[10px] tracking-[0.4em] text-[#9c9489] bg-black/40 px-6 py-2.5 rounded-full border border-[#f5f0e6]/10` | Fades in with scale (`0.95` $\rightarrow$ `1.0`), dots colored in `#d32020` |

---

## 8. Epilogue // Final Composition

> **Component**: [src/components/FinalSection.tsx](file:///c:/Vs%20Code/Scroll/src/components/FinalSection.tsx)  
> **Layout**: `min-h-[130vh]` scroll track with `sticky top-0 h-screen w-full flex flex-col justify-between py-10 px-6 md:px-20`.  
> **Motion**: Powerful monumental reveal over the final completed pose; mirrors the Hero's structure (Bone $\rightarrow$ Red, symbolizing commitment paid).

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & Behavior |
|---|---|---|---|
| **道** | Top-left header badge (`h-8 w-8`) | `font-cinzel text-xs font-bold text-[#d32020]` | Kanji for *The Way* / *Tao*, housed in red bordered square |
| **EPILOGUE // FINAL COMPOSITION** | Top-left header, beside badge | `font-mono text-xs uppercase tracking-[0.35em] text-[#9c9489]` | Header chapter identification |
| **REPLAY CINEMATIC SHOT** | Top-right header button | `font-mono text-[10px] tracking-widest text-[#9c9489] hover:text-[#d32020]` | Interactive button with up-arrow icon; calls `lenis.scrollTo(0, { duration: 2.2 })` |
| **THE UNENDING DISCIPLINE** | Center, above main title | `font-mono text-xs tracking-[0.4em] uppercase text-[#c5a059] bg-black/40 px-4 py-1.5 rounded-full border border-[#f5f0e6]/10` | Floating pill indicator |
| **WALK WITH** | Monumental center heading (Line 1) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#f5f0e6] leading-[1.02]` | Masked reveal from `yPercent: 120` $\rightarrow$ `0` |
| **HONOUR.** | Monumental center heading (Line 2) | `font-cinzel text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-[#d32020] leading-[1.02]` (Red) | Masked reveal starting 0.4s after Line 1 (Red commitment paid) |
| **The path is forged one step at a time.** | Centered under monumental heading | `font-mono text-xs sm:text-base uppercase tracking-[0.3em] text-[#f5f0e6]/90 max-w-xl` | Fades in and slides up (`y: 25` $\rightarrow$ `0`) |
| **ENTER THE PATH** | Centered primary CTA button | `font-cinzel text-sm sm:text-base font-bold tracking-[0.25em] text-[#f5f0e6]` | Button with border `#d32020`, no background until hover, and diagonal arrow; opens Pledge Modal |

### Warrior's Pledge Modal Text (Interactive State)

| Exact Text | Visual Placement | Typography & Styling | Function / Action |
|---|---|---|---|
| **THE WARRIOR'S PLEDGE** | Top header of modal dialog with shield icon | `font-mono text-xs uppercase tracking-[0.3em] text-[#d32020]` | Category banner |
| **I ACCEPT THE BURDEN OF THE BLADE.** | Modal main title | `font-cinzel text-2xl md:text-3xl font-bold text-[#f5f0e6]` | Header statement |
| **I commit to walking without shortcut. I recognize that true mastery resides not in the damage inflicted upon the world, but in the discipline enforced upon myself.** | Modal body copy | `font-mono text-xs text-[#9c9489] leading-relaxed` | The Oath / Creed |
| **SEAL OATH & RESTART** | Modal action button (Left / Primary) | `font-cinzel text-xs font-bold tracking-widest text-[#f5f0e6] bg-[#d32020] hover:bg-[#b01a1a]` | Closes modal and executes `scrollTo(0)` smooth replay |
| **RETURN TO SILENCE** | Modal action button (Right / Secondary) | `font-mono text-xs tracking-widest text-[#9c9489] border border-[#f5f0e6]/20 bg-[#f5f0e6]/5` | Dismisses modal without scrolling |

---

## 9. Ambient Audio Controller *(Integrated Chrome)*

> **Component**: [src/components/AudioController.tsx](file:///c:/Vs%20Code/Scroll/src/components/AudioController.tsx)  
> **Layout**: Fixed top-right floating pill (`fixed top-6 right-6 z-50`).  
> **Role**: Discreet browser chrome, kept entirely out of narrative hierarchy.

### Text & Placement Matrix

| Exact Text | Visual Placement | Typography & Styling | Motion & State |
|---|---|---|---|
| **ATMOSPHERE: ON** | Inside audio pill button | `font-mono text-[9px] tracking-widest uppercase text-[#f5f0e6]` | Displayed when procedural Web Audio wind/drone synthesizer is playing (bars animate) |
| **AUDIO: OFF** | Inside audio pill button | `font-mono text-[9px] tracking-widest uppercase text-[#9c9489]/50` | Displayed when audio context is muted/idle |
