/**
 * Encoded film frames, filled in by the Preloader as they download and read by the canvas.
 * Frames are kept as Blobs (not <img>) so the canvas can decode them with createImageBitmap,
 * which runs off the main thread; drawing an <img> decodes synchronously on the main thread.
 */
export class FrameStore {
  readonly blobs: (Blob | undefined)[];
  private readonly listeners = new Set<(index: number) => void>();

  constructor(count: number) {
    this.blobs = new Array(count);
  }

  set(index: number, blob: Blob) {
    this.blobs[index] = blob;
    this.listeners.forEach((listener) => listener(index));
  }

  subscribe(listener: (index: number) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
