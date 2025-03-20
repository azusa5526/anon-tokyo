export interface WebPAnimationFrame {
  data: Uint8Array | Uint8ClampedArray;
  duration: number;
}

export interface AWebPParams {
  width: number;
  height: number;
}

/**
 * 使用完畢必須呼叫 destroy 釋放佔用的資源
 */
export class AWebPCreator {
  public readonly width: number;
  public readonly height: number;
  private frames: WebPAnimationFrame[] = [];
  private worker: Worker;
  private canvas: HTMLCanvasElement;

  constructor(params: AWebPParams) {
    this.canvas = document.createElement('canvas');
    this.width = this.canvas.width = params.width;
    this.height = this.canvas.height = params.height;
    this.worker = new Worker(new URL('/awebp.worker.js', import.meta.url), {
      type: 'module',
    });
  }

  addFrame(frame: WebPAnimationFrame): void {
    this.frames.push(frame);
  }

  toUint8Array(img: CanvasImageSource): Uint8ClampedArray {
    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(img, 0, 0, this.width, this.height);
    const data = ctx.getImageData(0, 0, this.width, this.height);
    return data.data;
  }

  toBlob(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.worker.onerror = reject;
      this.worker.onmessageerror = reject;
      this.worker.onmessage = (event: MessageEvent) => {
        const result = event.data as Uint8Array;
        if (!result) {
          reject(
            `[AWebPCreator]: Failed toBlob(), frames length is ${this.frames.length}, size is ${this.width}x${this.height}`,
          );
          return;
        }
        const blob = new Blob([result], { type: 'image/webp' });
        resolve(blob);
      };
      this.worker.postMessage({ width: this.width, height: this.height, frames: this.frames });
    });
  }

  destroy(): void {
    this.worker.terminate();
  }
}
