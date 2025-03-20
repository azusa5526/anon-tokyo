/**
 * WASM 來自 https://github.com/nieyuyao/webp-wasm
 * 本地版本額外使用 MAXIMUM_MEMORY=4GB 編譯
 */
import { encodeAnimation } from './wasm-webp';

self.onmessage = (message) => {
  const data = message.data;
  encodeAnimation(data.width, data.height, true, data.frames).then(result => {
    self.postMessage(result);
  })
}