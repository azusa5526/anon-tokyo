<template>
  <router-view v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <AlertSnack />
</template>

<script setup lang="ts">
import AlertSnack from '@/components/AlertSnack.vue';
import { onMounted } from 'vue';
import { useAppStore } from '@/store/app';
import { useLocalStorage } from '@vueuse/core';

const appStore = useAppStore();
const firstVisit = useLocalStorage('firstVisit', true);

onMounted(() => {
  if (firstVisit.value) {
    appStore.infoDialogOpen = true;
    firstVisit.value = false;
  }
});
</script>
