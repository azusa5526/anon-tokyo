<template>
  <VSlider :min="0" :max="maxIndex" v-model="currentIndex" :disable-transition="isPlaying"></VSlider>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import VSlider from './VSlider.vue';

interface Props {
  maxIndex: number;
  isLoading?: boolean;
}

const speed = 1000 / 23.976;
const { maxIndex } = defineProps<Props>();

const emit = defineEmits<{
  'update:currentIndex': [currentIndex: number];
}>();

const currentIndex = ref(0);
let timer = ref<ReturnType<typeof setInterval> | null>(null);

const isPlaying = computed(() => !!timer.value);

const play = (speed = 200) => {
  currentIndex.value === maxIndex ? (currentIndex.value = 0) : currentIndex.value++; // 若在最後尾，重新播放，否則立即前進一格

  timer.value = setInterval(() => {
    if (currentIndex.value === maxIndex && timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    } else {
      currentIndex.value++;
    }
  }, speed);
};

const pause = () => {
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
};

const reset = () => {
  currentIndex.value = 0;
  pause();
};

// 組件 currentIndex 更新時，將更新值 emit 出去
watch(currentIndex, () => {
  emit('update:currentIndex', currentIndex.value);
});

// 當素材庫被清空沒有長度時，停止所有播放動作並重設播放器
watch(
  () => maxIndex,
  (val) => {
    if (!val) reset();
  },
);

defineExpose({ play, pause, reset, isPlaying });
</script>
