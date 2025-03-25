<template>
  <div class="flex h-full flex-col gap-y-3">
    <draggable
      :animation="300"
      item-key="addTime"
      class="hide-scroll-bar flex h-full flex-col gap-y-2 overflow-y-scroll"
      v-model="localValue"
      handle=".cursor-grab"
      tag="div"
      @change="handleDragChange"
    >
      <template #item="{ element: frameGroup, index }">
        <div
          class="relative aspect-video select-none"
          :class="{ 'cursor-grab': breakpointStore.isGreaterThanBreakpoint }"
          :data-driver="`frameGroup_${index}`"
        >
          <div
            class="absolute top-0 left-0 grid size-11 place-content-center bg-neutral-600/60 text-lg font-bold text-white lg:size-9"
            :class="{ 'cursor-grab': !breakpointStore.isGreaterThanBreakpoint }"
          >
            {{ index + 1 }}
          </div>
          <button
            class="absolute top-0 right-0 grid size-11 cursor-pointer place-items-center bg-red-400/70 hover:bg-red-300/70 lg:size-9"
            @click="handleDelete(index)"
          >
            <icon-ic-baseline-clear class="size-7 text-white" />
          </button>
          <div class="absolute bottom-0 left-0 w-full bg-white/80 text-center">
            {{ frameGroup.start }} ~ {{ frameGroup.end }}
          </div>
          <img
            draggable="false"
            class="cursor-pointer"
            @click="handleItemClick(index)"
            :src="imageUrl(frameGroup.ep, frameGroup.start)"
            :alt="`${frameGroup.ep} ${frameGroup.text}`"
            :title="`Ep${frameGroup.ep} ${frameGroup.text}`"
          />
        </div>
      </template>
    </draggable>

    <div
      class="bg-white py-1 text-center text-lg"
      :class="{ 'font-bold text-red-400': workStore.outputFrames.length > maxFrames }"
    >
      {{ workStore.outputFrames.length }} / {{ maxFrames }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import draggable from 'vuedraggable';
import { imageUrl, type FrameGroup } from '@/works/ave/ave';
import { useBreakpointStore } from '@/store/breakpoint';
import { useWorkStore } from '@/store/work';
import { maxFrames } from '@/constant';

interface Props {
  modelValue: FrameGroup[];
}

const { modelValue } = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: FrameGroup[]): void;
  (e: 'delete', index: number): void;
  (e: 'item-click', index: number): void;
  (e: 'drag-change', event: any): void;
}>();

const breakpointStore = useBreakpointStore();
const workStore = useWorkStore();

// 使用 computed 實現 v-model 雙向綁定，避免 watch 帶來的無限更新問題
const localValue = computed<FrameGroup[]>({
  get: () => modelValue,
  set: (val) => {
    emit('update:modelValue', val);
  },
});

function handleDelete(index: number) {
  emit('delete', index);
}

function handleItemClick(index: number) {
  emit('item-click', index);
}

function handleDragChange(event: any) {
  // 如果是拖曳移動事件，呼叫父層設定選取項目
  if (event && event.moved && typeof event.moved.newIndex === 'number') {
    emit('item-click', event.moved.newIndex);
    emit('drag-change', event);
  } else {
    console.warn('[Dragger] Unexpected drag change event:', event);
  }
}
</script>
