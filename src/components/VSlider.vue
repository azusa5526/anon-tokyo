<template>
  <div class="relative w-full select-none">
    <!-- 軌道：點擊軌道會更新數值 -->
    <div
      ref="trackRef"
      class="relative cursor-pointer rounded-full bg-white"
      :style="{ height: trackHeight + 'px' }"
      @pointerdown="onPointerDown"
      @touchstart="onPointerDown"
      @click="onTrackClick"
    >
      <!-- Ticks (如果啟用則顯示) -->
      <template v-if="ticks">
        <div
          v-for="i in tickCount"
          :key="i"
          :class="['absolute z-10 rounded-full', getTickColor(min + step * (i - 1))]"
          :style="getTickStyle(i)"
        ></div>
      </template>

      <!-- 已選區間背景 -->
      <div
        class="bg-mujica/85 absolute z-0 h-2 rounded"
        :class="{ 'transition-all duration-200 ease-in-out': !dragging && !disableTransition }"
        :style="{ width: getPercentage(localValue) + '%', height: trackHeight + 'px' }"
      ></div>

      <!-- Handle -->
      <div
        class="absolute top-1/2 z-20 -translate-1/2 transform cursor-pointer"
        :class="{ 'transition-all duration-200 ease-in-out': !dragging && !disableTransition }"
        :style="{ left: getPercentage(localValue) + '%' }"
      >
        <!-- 數值泡泡 -->
        <div
          v-if="thumb"
          class="bg-mujica absolute -top-10 left-1/2 -translate-x-1/2 transform rounded px-2.5 py-1.5 text-sm font-bold whitespace-nowrap text-white"
        >
          {{ localValue }}
        </div>
        <!-- 拖曳點 -->
        <div class="bg-mujica h-4 w-4 rounded-full border-3 border-white/15" :style="handleStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useDebounceFn } from '@vueuse/core';

interface Props {
  min?: number;
  max?: number;
  step?: number;
  ticks?: boolean;
  tickSize?: number;
  trackHeight?: number;
  handleSize?: number;
  modelValue: number;
  disableTransition?: boolean;
  thumb?: boolean;
}

const {
  min = 0,
  max = 100,
  step = 1,
  modelValue,
  ticks = false,
  tickSize = 4,
  trackHeight = 12,
  handleSize = 24,
  disableTransition = false,
  thumb = false,
} = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
}>();

const trackRef = ref<HTMLElement | null>(null);
const localValue = ref<number>(modelValue);

// 同步外部傳入的 modelValue
watch(
  () => modelValue,
  (newVal) => {
    localValue.value = newVal;
  },
);

const getPercentage = (value: number): number => ((value - min) / (max - min)) * 100;

const tickCount = computed(() => Math.floor((max - min) / step) + 1);

const getTickStyle = (i: number) => {
  const tickValue = min + step * (i - 1);
  return {
    left: getPercentage(tickValue) + '%',
    width: tickSize + 'px',
    height: tickSize + 'px',
    top: `calc(50% - ${tickSize / 2}px)`,
    transform: 'translateX(-50%)',
    position: 'absolute' as const,
  };
};

const getTickColor = (tickValue: number): string => (tickValue <= localValue.value ? 'bg-white' : 'bg-gray-500');

const handleStyle = computed(() => ({
  width: handleSize + 'px',
  height: handleSize + 'px',
}));

const dragging = ref(false);
const touchId = ref<number | null>(null); // 用於追踪特定的觸控點

// 只針對拖曳時的更新做 debounce（例如 200ms）
const debouncedEmit = useDebounceFn((val: number) => {
  emit('update:modelValue', val);
}, 200);

const onPointerDown = (event: PointerEvent | TouchEvent) => {
  event.preventDefault();

  if ('touches' in event) {
    dragging.value = true;
    touchId.value = event.touches[0].identifier;
    document.addEventListener('touchmove', onPointerMove as EventListener);
    document.addEventListener('touchend', onPointerUp as EventListener);
    document.addEventListener('touchcancel', onPointerUp as EventListener);
  } else {
    dragging.value = true;
    document.addEventListener('pointermove', onPointerMove as EventListener);
    document.addEventListener('pointerup', onPointerUp as EventListener);
  }
};

const onPointerMove = (event: PointerEvent | TouchEvent) => {
  if (!dragging.value || !trackRef.value) return;

  const rect = trackRef.value.getBoundingClientRect();
  let relativeX: number;

  if ('touches' in event) {
    const touch = Array.from(event.touches).find((t) => t.identifier === touchId.value);
    if (!touch) return;
    relativeX = touch.clientX - rect.left;
  } else {
    relativeX = (event as PointerEvent).clientX - rect.left;
  }

  let percent = relativeX / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);
  let newValue = min + percent * (max - min);
  newValue = Math.round(newValue / step) * step;
  newValue = Math.min(Math.max(newValue, min), max);

  if (newValue !== localValue.value) {
    localValue.value = newValue;
    // 拖曳時使用 debounce 更新
    debouncedEmit(newValue);
  }
};

const onPointerUp = (event: PointerEvent | TouchEvent) => {
  dragging.value = false;
  touchId.value = null;

  if ('touches' in event) {
    document.removeEventListener('touchmove', onPointerMove as EventListener);
    document.removeEventListener('touchend', onPointerUp as EventListener);
    document.removeEventListener('touchcancel', onPointerUp as EventListener);
  } else {
    document.removeEventListener('pointermove', onPointerMove as EventListener);
    document.removeEventListener('pointerup', onPointerUp as EventListener);
  }
};

const onTrackClick = (event: MouseEvent | TouchEvent) => {
  if (!trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  let relativeX: number;

  if ('touches' in event) {
    relativeX = event.touches[0].clientX - rect.left;
  } else {
    relativeX = (event as MouseEvent).clientX - rect.left;
  }

  let percent = relativeX / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);
  let newValue = min + percent * (max - min);
  newValue = Math.round(newValue / step) * step;
  newValue = Math.min(Math.max(newValue, min), max);

  if (newValue !== localValue.value) {
    localValue.value = newValue;
    // 點擊軌道則直接更新，不需 debounce
    emit('update:modelValue', newValue);
  }
};
</script>
