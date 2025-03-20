import { defineStore } from 'pinia';
import { indexIterator, type FrameGroup } from '@/works/ave/ave';
import { useLocalStorage, type RemovableRef } from '@vueuse/core';

export type FrameGroupWithAddTime = FrameGroup & { addTime: string };

interface State {
  works: Record<string, FrameGroup[]>;
  selectedFrameGroups: RemovableRef<FrameGroupWithAddTime[]>;
  originFrameGroupMap: RemovableRef<Map<string, FrameGroup>>;
  isLoadingImages: boolean;
}

export const useWorkStore = defineStore('work', {
  state: (): State => ({
    works: {
      ave: [...indexIterator()],
    },
    selectedFrameGroups: useLocalStorage('work.selectedFrameGroups', []),
    originFrameGroupMap: useLocalStorage('work.originFrameGroupMap', new Map()),
    isLoadingImages: false,
  }),

  actions: {},

  getters: {
    outputFrames() {
      if (!this.selectedFrameGroups.length) return [];

      const frames: { ep: number; frame: number }[] = [];
      for (const frameGroup of this.selectedFrameGroups) {
        for (let f = frameGroup.start; f <= frameGroup.end; f++) {
          frames.push({ ep: frameGroup.ep, frame: f });
        }
      }
      return frames;
    },
  },
});
