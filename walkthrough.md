# Walkthrough — 1,520 Frames at 60FPS (16ms Time Gap) & Dual-Frame Interpolation

## Overview
To achieve the absolute pinnacle of fluid, continuous motion, we have extracted and integrated **1,520 frames** covering the complete 25.33-second video sequence at **60 frames per second**, shrinking the inter-frame time gap from ~33ms down to **16.6 milliseconds**. Combined with our dual-frame canvas cross-fade interpolation and staged progressive streaming, this delivers an ultra-dense, microscopic scrub experience.

---

## Technical Enhancements

### 1. 1,520 Frames at 60FPS (16.6ms Time Gap)
- **Frame Density**: Extracted 1,520 frames (`frame_0001.webp` to `frame_1520.webp`) across the entire 25.33-second film sequence at 60 FPS.
- **Inter-Frame Interval**: Reduced temporal spacing between frames from 33ms to **16.6ms** (halved the time gap).
- **Resolution & Optimization**: Scaled to 1600x900 WebP at quality 65, balancing razor-sharp clarity on retina displays with lightweight GPU texture bandwidth.
- **Manifest**: [public/frames.json](file:///c:/Vs%20Code/Scroll/public/frames.json) updated with all 1,520 assets.

### 2. Sub-Frame Interpolation & Off-Thread Decoding
- [SamuraiBackgroundCanvas.tsx](file:///c:/Vs%20Code/Scroll/src/components/SamuraiBackgroundCanvas.tsx) draws each tick as an interpolated blend of the two decoded frames that bracket the playhead:
  1. **Linear Cross-Fade**: The later frame is layered over the earlier at opacity $t$ (the playhead's fractional position between them), so under a constant scroll the image changes at a constant rate. Eased curves such as smootherstep hold each frame and rush between them, which reads as judder.
  2. **Velocity-Adaptive Shutter Blur**: Above 6 frames/sec of scrub speed, the film `max(2, stride)` frames ahead is layered in faintly (≤14%). It is interpolated the same way as the base, so it fades in continuously instead of popping whenever a specific frame is or isn't decoded.
  3. **Off-Thread Decoded Frame Window**: Frames are kept as Blobs and decoded with `createImageBitmap` (off the main thread), cropped and scaled to the canvas size, up to 6 at a time. Only decoded frames are ever drawn. Drawing an undecoded `<img>` would force a ~10ms synchronous WebP decode on the main thread on every frame change, which was the source of the dropped frames.
  4. **Speed-Adaptive Stride**: Slow scrolls decode every frame (16 ahead, 6 behind). Fast scrolls cross more frames per refresh than can be decoded, so the window decodes every Nth frame (N = frames crossed per 60Hz refresh, max 12) on a stable grid, and the blend interpolates across the gap instead of freezing. At most 40 bitmaps are kept; frames behind the playhead are evicted first, and `close()` runs in idle time.
  - The canvas context is not `desynchronized`, so draws stay on the compositor's vsync and don't tear; the spring clamps `dt ≥ 0` because rAF timestamps can precede the `performance.now()` that started the loop.
### 3. Staged Fast-Boot Streaming Architecture
- [Preloader.tsx](file:///c:/Vs%20Code/Scroll/src/components/Preloader.tsx) fetches frames as Blobs into a shared [`FrameStore`](file:///c:/Vs%20Code/Scroll/src/lib/frameStore.ts) in two phases:
  - **Phase 1 (Instant Entrance)**: Prioritizes the first 100 frames (~5.5MB) to let users enter in ~400–500ms.
  - **Phase 2 (Background Streaming)**: Streams the remaining 1,420 frames in throttled batches of 30 every 40ms without dropping UI frames.
  - **Zero-Flicker Fallback**: If the user scrolls rapidly ahead of the streaming buffer, the canvas safely draws the nearest available frame, guaranteeing zero black flashes.

### 4. 2nd-Order Critically-Damped Spring Physics & Lenis Smooth Scroll
- [SmoothScroll.tsx](file:///c:/Vs%20Code/Scroll/src/components/SmoothScroll.tsx) is tuned with `duration: 2.2s`, `wheelMultiplier: 0.85`, `touchMultiplier: 1.5`, and `syncTouch: true`.
- [SamuraiBackgroundCanvas.tsx](file:///c:/Vs%20Code/Scroll/src/components/SamuraiBackgroundCanvas.tsx) incorporates a 2nd-order critically-damped spring-damper ($\omega = 18.0$, $\zeta = 1.0$) with exact analytical exponential integration:
  $$e = \exp(-\omega \cdot \Delta t)$$
  $$c_1 = x - x_{\text{target}}, \quad c_2 = v + \omega \cdot c_1$$
  $$x_{\text{new}} = x_{\text{target}} + (c_1 + c_2 \cdot \Delta t) \cdot e, \quad v_{\text{new}} = (v - \omega \cdot c_2 \cdot \Delta t) \cdot e$$
  This guarantees continuous acceleration and velocity, eliminating mouse-wheel click discretization and high-refresh-rate display variance with sub-millimeter precision ($10^{-7}$ epsilon).

## Verification
- **Dev Server**: Active and responding with 200 on `http://localhost:3000`.
- **Production Build**: `npm run build` compiled cleanly with 0 errors (Turbopack + TypeScript).
- **Asset Confirmation**: All 1,520 WebP frames verified in `public/frames_webp/` and indexed in `public/frames.json`.
