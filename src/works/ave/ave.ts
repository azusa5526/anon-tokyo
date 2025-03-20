import index from '@/works/ave/ave.json';

export interface FrameGroup {
  ep: number;
  start: number;
  end: number;
  text: string;
  id: string;
}

export interface VirtualScrollerItem extends FrameGroup {
  size: number;
}

/**
 *
 * @param episode 輸入要迭代的集數，null 代表全部。 default `null`
 */
export function* indexIterator(episode: number | null = null) {
  const eps = episode
    ? ([[`${episode}`, index[episode]]] satisfies [string, [number, number, string][]][])
    : Object.entries(index);
  for (const [ep, val] of eps) {
    for (const [start, end, text] of val) {
      yield {
        ep: +ep,
        start,
        end,
        text,
        id: `${ep}-${start}-${end}`,
      };
    }
  }
}

export const virtualScrollerGap = 8;
function virtualScrollerItemSize(start: number, end: number) {
  const range = end - start;
  const framePixel = 3;
  const widthPixel = range * framePixel + virtualScrollerGap;
  return widthPixel;
}

export function virtualScrollerItems(episode: number): VirtualScrollerItem[] {
  const startFrame = 1;
  const lastFrame = 34560;
  const groups = indexIterator(episode);
  const ret: VirtualScrollerItem[] = [];
  let currentFrame = startFrame;
  for (const group of groups) {
    const { start, end } = group;
    if (currentFrame < start) {
      ret.push({
        ep: episode,
        start: currentFrame,
        end: start - 1,
        text: '',
        id: `${episode}-${currentFrame}-${start - 1}`,
        size: virtualScrollerItemSize(currentFrame, start - 1),
      });
    }
    ret.push({ ...group, size: virtualScrollerItemSize(start, end) });
    currentFrame = end + 1;
  }

  if (currentFrame < lastFrame) {
    ret.push({
      ep: episode,
      start: currentFrame,
      end: lastFrame,
      text: '',
      id: `${episode}-${currentFrame}-${lastFrame}`,
      size: virtualScrollerItemSize(currentFrame, lastFrame),
    });
  }

  return ret;
}

export function searchByKeyword(keyword: string): FrameGroup[] {
  const arr: FrameGroup[] = [];
  for (const item of indexIterator()) {
    if (item.text.includes(keyword)) {
      arr.push(item);
    }
  }
  return arr;
}

export function imageHost(ep: number, frame: number) {
  if (frame % 2 === 1) {
    return `https://ave-mujica-ep${ep}-odd.pages.dev`;
  } else {
    return `https://ave-mujica-ep${ep}-even.pages.dev`;
  }
}

export function imageUrl(ep: number, frame: number) {
  return `${imageHost(ep, frame)}/${frame}.webp`;
}
