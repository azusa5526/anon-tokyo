<template>
  <div
    class="fixed top-12 right-4 z-2500 ml-4 h-auto max-h-[calc(100vh-150px)] max-w-sm overflow-x-clip !text-sm text-white select-none"
  >
    <div v-for="item in alert.alerts" :key="item.id" class="mb-4">
      <div class="rounded-2xl p-4" :class="itemClass(item)">
        {{ item.text }}
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAlertStore, type AlertItem } from '@/store/alert';

const alert = useAlertStore();

function itemClass(item: AlertItem) {
  const cls: string[] = [];
  if (item.type) {
    cls.push(`bg-${item.type}`);
  }
  return cls;
}
</script>
