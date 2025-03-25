<template>
  <transition name="fade">
    <div v-if="modelValue && mask" class="fixed inset-0 z-30 bg-black/50"></div>
  </transition>

  <transition :name="sideTransitionName">
    <div v-if="modelValue" ref="drawerRef" :class="['fixed top-0 bottom-0 z-30 w-72 bg-white shadow-lg', sidePosition]">
      <slot />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from 'vue';
import { onClickOutside } from '@vueuse/core';

interface Props {
  modelValue: boolean;
  side?: 'left' | 'right';
  mask?: boolean;
}

const { modelValue = false, side = 'left', mask = true } = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();

const drawerRef = useTemplateRef('drawerRef');

const sidePosition = computed(() => {
  return side === 'left' ? 'left-0' : 'right-0';
});
const sideTransitionName = computed(() => {
  return side === 'left' ? 'slide-left' : 'slide-right';
});

// onClickOutside 的停止監聽函式
let stopClickOutside: () => void = () => {};

// 監聽 mask prop 的變化，動態啟用或停用 onClickOutside 檢測
watch(
  () => mask,
  (newVal) => {
    // 先停止舊的監聽
    stopClickOutside();
    if (newVal) {
      stopClickOutside = onClickOutside(drawerRef, (event: MouseEvent) => {
        emit('update:modelValue', false);
      });
    }
  },
  { immediate: true },
);
</script>

<style scoped>
/* Mask 過渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* 左側 drawer 的滑動過渡 */
.slide-left-enter-active,
.slide-left-leave-active {
  transition: transform 0.2s;
}
.slide-left-enter-from,
.slide-left-leave-to {
  transform: translateX(-100%);
}
.slide-left-enter-to,
.slide-left-leave-from {
  transform: translateX(0);
}

/* 右側 drawer 的滑動過渡 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s;
}
.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
}
.slide-right-enter-to,
.slide-right-leave-from {
  transform: translateX(0);
}
</style>
