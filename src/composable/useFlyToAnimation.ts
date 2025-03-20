import type { Ref } from 'vue';

export function useFlyToAnimation(targetElement: Ref<HTMLElement | null>) {
  /**
   * 飛入動畫函式：
   * 1. 取得點擊按鈕所在的圖片元素，複製並固定定位。
   * 2. 根據 targetElement 的位置，計算位移與縮放效果。
   * 3. 使用 CSS transition 執行動畫，動畫結束後移除複製的圖片。
   * 此函式回傳一個 Promise，動畫完成後才 resolve。
   */
  function flyToAnimation(event: Event): Promise<void> {
    return new Promise((resolve) => {
      const btn = event.currentTarget as HTMLElement;
      const groupElement = btn.closest('.group');
      if (!groupElement) {
        resolve();
        return;
      }
      const imgElement = groupElement.querySelector('img');
      if (!imgElement) {
        resolve();
        return;
      }

      const rect = imgElement.getBoundingClientRect();
      const clone = imgElement.cloneNode(true) as HTMLImageElement;
      clone.style.position = 'fixed';
      clone.style.left = rect.left + 'px';
      clone.style.top = rect.top + 'px';
      clone.style.width = rect.width + 'px';
      clone.style.height = rect.height + 'px';
      clone.style.transition = 'all 0.5s ease-in-out';
      clone.style.zIndex = '9999';
      document.body.appendChild(clone);

      // 取得飛往的 targetElement 位置
      const element = targetElement.value;
      if (!element) {
        resolve();
        return;
      }
      const targetRect = element.getBoundingClientRect();
      // 以 targetElement 容器的中心作為目標位置
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;
      const imgCenterX = rect.left + rect.width / 2;
      const imgCenterY = rect.top + rect.height / 2;
      const deltaX = targetX - imgCenterX;
      const deltaY = targetY - imgCenterY;

      // 確保初始樣式渲染後再開始過渡
      requestAnimationFrame(() => {
        clone.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.15)`;
        clone.style.opacity = '0.1';
      });

      // transitionend 事件只觸發一次
      clone.addEventListener(
        'transitionend',
        () => {
          if (clone.parentElement) {
            clone.parentElement.removeChild(clone);
          }
          resolve();
        },
        { once: true },
      );
    });
  }

  return { flyToAnimation };
}
