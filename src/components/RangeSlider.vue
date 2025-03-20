<template>
  <div class="relative w-full cursor-pointer select-none">
    <!-- 軌道：點擊軌道會更新數值 -->
    <div
      ref="trackRef"
      class="relative rounded-full bg-white"
      :style="{ height: trackHeight + 'px' }"
      @click="onTrackClick"
      @touchend="onTrackClick"
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
        :class="{ 'transition-all duration-200 ease-in-out': !dragging }"
        :style="{
          left: getPercentage(localValue[0]) + '%',
          width: getPercentage(localValue[1]) - getPercentage(localValue[0]) + '%',
          height: trackHeight + 'px',
        }"
      ></div>

      <!-- 左側 handle -->
      <div
        class="absolute top-1/2 z-20 -translate-1/2 transform cursor-pointer"
        :class="{ 'transition-all duration-200 ease-in-out': !dragging }"
        :style="{ left: getPercentage(localValue[0]) + '%' }"
        @pointerdown.stop="onPointerDown($event, 'left')"
        @touchstart.stop="onTouchStart($event, 'left')"
      >
        <div
          class="bg-mujica absolute -top-9 left-1/2 -translate-x-1/2 transform rounded px-2.5 py-1 text-sm font-bold whitespace-nowrap text-white"
        >
          {{ localValue[0] }}
        </div>
        <div class="bg-mujica h-4 w-4 rounded-full border-3 border-white/15" :style="handleStyle"></div>
      </div>

      <!-- 右側 handle -->
      <div
        class="absolute top-1/2 z-20 -translate-1/2 transform cursor-pointer"
        :class="{ 'transition-all duration-200 ease-in-out': !dragging }"
        :style="{ left: getPercentage(localValue[1]) + '%' }"
        @pointerdown.stop="onPointerDown($event, 'right')"
        @touchstart.stop="onTouchStart($event, 'right')"
      >
        <div
          class="bg-mujica absolute -top-9 left-1/2 -translate-x-1/2 transform rounded px-2.5 py-1 text-sm font-bold whitespace-nowrap text-white"
        >
          {{ localValue[1] }}
        </div>
        <div class="bg-mujica h-4 w-4 rounded-full border-3 border-white/15" :style="handleStyle"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

interface Props {
  min?: number;
  max?: number;
  step?: number;
  ticks?: boolean;
  tickSize?: number;
  trackHeight?: number;
  handleSize?: number;
  modelValue: [number, number];
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
} = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: [number, number]): void;
  (e: 'handle-active', handle: 'left' | 'right'): void;
}>();

const trackRef = ref<HTMLElement | null>(null);
const localValue = ref<[number, number]>(modelValue);

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

const getTickColor = (tickValue: number): string => {
  const [start, end] = localValue.value;
  return tickValue >= start && tickValue <= end ? 'bg-white' : 'bg-gray-500';
};

const handleStyle = computed(() => ({
  width: handleSize + 'px',
  height: handleSize + 'px',
}));

type HandleType = 'left' | 'right';
const dragging = ref<HandleType | null>(null);

// Pointer 事件處理
const onPointerDown = (event: PointerEvent, handle: HandleType) => {
  event.preventDefault();
  dragging.value = handle;
  emit('handle-active', handle);
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('pointerup', onPointerUp);
};

const onPointerMove = (event: PointerEvent) => {
  if (!dragging.value || !trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  let relativeX = event.clientX - rect.left;
  let percent = relativeX / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);
  let newValue = min + percent * (max - min);
  newValue = Math.round(newValue / step) * step;
  newValue = Math.min(Math.max(newValue, min), max);

  let [leftValue, rightValue] = localValue.value;
  if (dragging.value === 'left') {
    if (newValue > rightValue) newValue = rightValue;
    if (newValue !== leftValue) {
      leftValue = newValue;
      localValue.value = [leftValue, rightValue];
      emit('update:modelValue', [leftValue, rightValue]);
    }
  } else if (dragging.value === 'right') {
    if (newValue < leftValue) newValue = leftValue;
    if (newValue !== rightValue) {
      rightValue = newValue;
      localValue.value = [leftValue, rightValue];
      emit('update:modelValue', [leftValue, rightValue]);
    }
  }
};

const onPointerUp = () => {
  dragging.value = null;
  document.removeEventListener('pointermove', onPointerMove);
  document.removeEventListener('pointerup', onPointerUp);
};

// 添加觸控事件處理
const onTouchStart = (event: TouchEvent, handle: HandleType) => {
  event.preventDefault();
  dragging.value = handle;
  emit('handle-active', handle);
  document.addEventListener('touchmove', onTouchMove);
  document.addEventListener('touchend', onTouchEnd);
  document.addEventListener('touchcancel', onTouchEnd);
};

const onTouchMove = (event: TouchEvent) => {
  if (!dragging.value || !trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  const touch = event.touches[0];
  let relativeX = touch.clientX - rect.left;
  let percent = relativeX / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);
  let newValue = min + percent * (max - min);
  newValue = Math.round(newValue / step) * step;
  newValue = Math.min(Math.max(newValue, min), max);

  let [leftValue, rightValue] = localValue.value;
  if (dragging.value === 'left') {
    if (newValue > rightValue) newValue = rightValue;
    if (newValue !== leftValue) {
      leftValue = newValue;
      localValue.value = [leftValue, rightValue];
      emit('update:modelValue', [leftValue, rightValue]);
    }
  } else if (dragging.value === 'right') {
    if (newValue < leftValue) newValue = leftValue;
    if (newValue !== rightValue) {
      rightValue = newValue;
      localValue.value = [leftValue, rightValue];
      emit('update:modelValue', [leftValue, rightValue]);
    }
  }
};

const onTouchEnd = () => {
  dragging.value = null;
  document.removeEventListener('touchmove', onTouchMove);
  document.removeEventListener('touchend', onTouchEnd);
  document.removeEventListener('touchcancel', onTouchEnd);
};

// 修改 onTrackClick 同時支援 MouseEvent 與 TouchEvent
const onTrackClick = (event: MouseEvent | TouchEvent) => {
  if (!trackRef.value) return;
  const rect = trackRef.value.getBoundingClientRect();
  let clientX: number;
  if (event instanceof TouchEvent) {
    clientX = event.changedTouches[0].clientX;
  } else {
    clientX = event.clientX;
  }
  let relativeX = clientX - rect.left;
  let percent = relativeX / rect.width;
  percent = Math.min(Math.max(percent, 0), 1);
  let newValue = min + percent * (max - min);
  newValue = Math.round(newValue / step) * step;
  newValue = Math.min(Math.max(newValue, min), max);

  const [leftValue, rightValue] = localValue.value;
  const distLeft = Math.abs(newValue - leftValue);
  const distRight = Math.abs(newValue - rightValue);
  if (distLeft <= distRight) {
    // 更新左側
    const newLeft = Math.min(newValue, rightValue);
    localValue.value = [newLeft, rightValue];
    emit('update:modelValue', [newLeft, rightValue]);
  } else {
    // 更新右側
    const newRight = Math.max(newValue, leftValue);
    localValue.value = [leftValue, newRight];
    emit('update:modelValue', [leftValue, newRight]);
  }
};
</script>
