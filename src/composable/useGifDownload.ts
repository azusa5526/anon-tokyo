import { ref } from 'vue';
import GIF from 'gif.js';

/**
 * 用來生成並下載 GIF 的 composable。
 *
 * @param defaultScaleWidth 預設 GIF 寬度
 * @param defaultScaleHeight 預設 GIF 高度
 * @param defaultSpeed 預設每一幀延遲（毫秒）
 */
export function useGifDownload(
  defaultScaleWidth: number = 320,
  defaultScaleHeight: number = 180,
  defaultSpeed: number = 200,
) {
  const gifUrl = ref('');
  let gif = createGif(defaultScaleWidth, defaultScaleHeight);

  function createGif(scaleWidth: number, scaleHeight: number) {
    return new GIF({
      workerScript: '/gif.worker.js',
      width: scaleWidth,
      height: scaleHeight,
    });
  }

  /**
   * 將多張圖片生成 GIF 並下載。
   *
   * @param images HTMLImageElement 陣列
   * @param options 可選設定物件，包含：
   *  - scaleWidth: GIF 寬度 (預設為 defaultScaleWidth)
   *  - scaleHeight: GIF 高度 (預設為 defaultScaleHeight)
   *  - speed: 每一幀延遲 (預設為 defaultSpeed)
   * @returns Promise 會在 GIF 完成渲染後 resolve
   */
  async function getGifBlob(
    images: (HTMLImageElement | null)[],
    options: { scaleWidth?: number; scaleHeight?: number; speed?: number } = {},
  ): Promise<Blob> {
    const scaleWidth = options.scaleWidth ?? defaultScaleWidth;
    const scaleHeight = options.scaleHeight ?? defaultScaleHeight;
    const speed = options.speed ?? defaultSpeed;

    if (!images.length) throw new Error('images not found');

    const canvas = document.createElement('canvas');
    canvas.width = scaleWidth;
    canvas.height = scaleHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;

    // 重新建立 gif 實例（若參數有變更）
    gif = createGif(scaleWidth, scaleHeight);

    images.forEach((img) => {
      if (img) {
        ctx.clearRect(0, 0, scaleWidth, scaleHeight);
        ctx.drawImage(img, 0, 0, scaleWidth, scaleHeight);
        gif.addFrame(ctx, { copy: true, delay: speed });
      }
    });

    // 等到 finished 事件觸發後 resolve
    return new Promise((resolve, reject) => {
      gif.on('finished', (blob: Blob) => {
        gifUrl.value = URL.createObjectURL(blob);
        gif = createGif(scaleWidth, scaleHeight);
        resolve(blob);
      });
      gif.render();
    });
  }

  return {
    gifUrl,
    getGifBlob,
  };
}
