<template>
  <VDialog
    v-model="appStore.infoDialogOpen"
    dialogClass="bg-neutral-50 w-full max-w-[480px] max-h-full rounded-lg"
    data-driver="infoDialog"
  >
    <template #content>
      <div class="relative p-5 md:p-7">
        <button
          class="absolute top-0 right-0 cursor-pointer p-3 outline-none hover:opacity-70"
          @click="appStore.infoDialogOpen = false"
        >
          <icon-ic-baseline-clear role="button" class="size-7 text-gray-500 outline-none" />
        </button>
        <div class="mt-7 mb-5 text-xl font-bold text-neutral-700 md:text-2xl">
          歡迎來到
          <span class="text-mujica">Ave Mujica</span>
          的世界
        </div>
        <p class="text-start">在這裡，你可以搜尋並加入喜歡的台詞到素材庫，排列、編修，最後製作成你專屬的動圖。</p>

        <div class="my-4 flex flex-nowrap items-center">
          <div>更多說明，請按頂部</div>
          <button
            class="text-mujica mx-2 grid size-10 place-items-center rounded border-2 bg-white p-1 text-xl font-bold shadow-lg"
          >
            <icon-ic-baseline-question-mark class="size-7" />
          </button>
          <div>按鈕</div>
        </div>

        <ul class="my-4 text-start text-neutral-500">
          <li>* 目前包含 Ave Mujica 1 - 12 話片段</li>
          <li>* 下載幀數多或選較高畫質耗時較長，請耐心等候</li>
        </ul>

        <a href="https://github.com/azusa5526/anon-tokyo" class="flex items-center justify-center hover:opacity-80">
          <img src="/mdi--github.svg" alt="github" class="mr-1 size-8" />
          <span class="text-neutral-900">Github</span>
        </a>
      </div>
    </template>
  </VDialog>
</template>

<script setup lang="ts">
import { useAppStore } from '@/store/app';

const appStore = useAppStore();
</script>
