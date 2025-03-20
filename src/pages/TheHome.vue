<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-neutral-800">
    <div class="bg-mujica flex h-14 items-center justify-between px-3 text-white">
      <div class="relative mr-3 max-w-72 grow" data-driver="search">
        <input
          v-model="searchText"
          type="text"
          autofocus
          class="ease w-full bg-transparent py-1.5 pr-9 pl-3 text-lg text-neutral-200 outline-2 outline-neutral-300/90 placeholder:text-white focus:placeholder:text-white/75"
          placeholder="搜尋台詞"
          @input="searchDebounce"
        />
        <button v-if="searchText.length" class="absolute top-1/2 right-1.5 size-6 -translate-y-1/2 text-neutral-300/90">
          <icon-ic-baseline-clear @click="() => (searchText = '')" class="size-6" />
        </button>
        <icon-ic-baseline-search
          v-else
          class="absolute top-1/2 right-1.5 size-6 -translate-y-1/2 text-neutral-300/90"
        />
      </div>

      <div class="flex gap-x-3">
        <button
          @click="appStore.infoDialogOpen = true"
          class="text-mujica grid size-10 cursor-pointer place-items-center rounded bg-white p-1 text-xl font-bold transition-all hover:scale-105 hover:opacity-85"
        >
          <icon-ic-outline-info class="size-7" />
          <InfoDialog />
        </button>
        <button
          @click="startDriver"
          class="text-mujica grid size-10 cursor-pointer place-items-center rounded bg-white p-1 text-xl font-bold transition-all hover:scale-105 hover:opacity-85"
        >
          <icon-ic-baseline-question-mark class="size-7" />
        </button>
        <button
          ref="animeButtonRef"
          @click="$router.push({ name: 'Anime' })"
          class="text-mujica relative grid size-10 cursor-pointer place-items-center rounded bg-white text-xl font-bold transition-all hover:scale-105 hover:opacity-85"
          :class="['', showAddedAnimation ? 'animate-button' : '']"
          data-driver="framesBag"
        >
          <div
            class="absolute right-1 bottom-1 grid aspect-square size-4.5 place-items-center rounded-full bg-amber-400 text-xs text-neutral-900"
          >
            {{ workStore.selectedFrameGroups.length }}
          </div>
          <icon-ic-outline-shopping-bag class="size-8" />
        </button>
      </div>
    </div>

    <div class="flex flex-1 overflow-hidden">
      <VDialog v-model="dialogOpen" dialogClass=" w-full h-full rounded-lg p-3 bg-neutral-600">
        <template #content>
          <div v-if="selectedFrameGroup" class="relative flex h-full flex-col items-center rounded-lg bg-neutral-600">
            <img
              @click="copyImageUrl"
              :src="imageUrl(selectedFrameGroup.ep, slideValue)"
              class="mb-8 h-full min-h-0 w-fit shrink cursor-pointer object-contain"
              draggable="false"
            />
            <transition name="tooltip">
              <div
                v-if="tooltipVisible"
                :style="tooltipStyle"
                class="pointer-events-none fixed rounded bg-neutral-700 px-3 py-1.5 text-sm text-nowrap text-white"
              >
                已複製網址
              </div>
            </transition>

            <div class="w-full shrink-0 rounded bg-neutral-700 px-4 py-4 lg:px-10 lg:py-6">
              <VSlider
                :min="selectedFrameGroup.start"
                :max="selectedFrameGroup.end"
                :thumb="true"
                ticks
                v-model="slideValue"
                class="mb-6"
              />
              <RecycleScroller
                @visible="onVScrollerVisible"
                @wheel="onWheel"
                ref="vScroller"
                class="hide-scroll-bar h-10 md:h-12"
                :direction="'horizontal'"
                :items="frameGroupByEpisode"
                v-slot="{ item, index }"
              >
                <div
                  @click="onScrollerItemClick(item)"
                  class="flex h-full cursor-pointer items-center rounded border-2 text-neutral-100 transition-opacity"
                  :class="
                    selectedFrameGroup.id === item.id
                      ? 'bg-mujica border-white'
                      : 'border-neutral-400 bg-neutral-50/10 hover:opacity-75'
                  "
                  :title="`Ep${item.ep} [${item.start}-${item.end}] ${item.text}`"
                  :style="{ width: `${item.size - virtualScrollerGap}px` }"
                >
                  <div class="truncate pl-2 select-none md:text-lg">{{ item.text }}</div>
                </div>
              </RecycleScroller>
            </div>

            <div class="absolute top-0 right-0 flex flex-nowrap">
              <button class="grid size-12 place-items-center">
                <icon-ic-baseline-content-copy
                  @click="copyImageUrl"
                  role="button"
                  tabindex="1"
                  class="size-8 cursor-pointer p-1 text-neutral-200 outline-none"
                />
              </button>
              <button class="grid size-12 place-items-center">
                <icon-ic-baseline-clear
                  @click="dialogOpen = false"
                  role="button"
                  tabindex="1"
                  class="size-10 cursor-pointer p-1 text-neutral-200 outline-none"
                />
              </button>
            </div>
          </div>
        </template>
      </VDialog>

      <div v-if="isShowEmptyMessage" class="w-full p-4 text-lg text-[#e5cd9d]">
        搜尋結果是空的呢，試著搜尋我最喜歡的
        <span
          class="cursor-pointer text-[#a3bee7]"
          @click="
            searchText = '小祥';
            search();
          "
        >
          「小祥」
        </span>
        如何？
      </div>
      <div
        v-else
        ref="searchResultContainer"
        class="hide-scroll-bar grid w-full flex-1 [grid-auto-rows:min-content] grid-cols-1 gap-4 overflow-y-auto p-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5"
        data-driver="searchResult"
      >
        <div
          v-for="(frameGroup, i) in searchResultShouldDisplay"
          :key="frameGroup.id"
          class="group relative transition-transform hover:scale-102"
          :data-driver="`searchResult_${i}`"
        >
          <div class="absolute top-0 right-0">
            <button
              class="group-hover:bg-mujica bg-mujica cursor-pointer p-1 opacity-100 transition group-hover:opacity-100 md:opacity-0"
              :class="{
                'opacity-100!': isDriverActive,
              }"
              @click="(event) => onAddFrameGroupClick(event, frameGroup)"
              :data-driver="`searchResultAdd_${i}`"
            >
              <icon-ic-baseline-add class="size-8 text-white"></icon-ic-baseline-add>
            </button>
          </div>

          <img
            :src="imageUrl(frameGroup.ep, frameGroup.start)"
            :alt="`${frameGroup.ep} ${frameGroup.text}`"
            :title="`Ep${frameGroup.ep} ${frameGroup.text}`"
            loading="lazy"
            draggable="false"
            @load="onImageLoad"
            @click="onImageClick(frameGroup)"
            class="group-hover:border-mujica h-auto cursor-pointer border-gray-600 object-cover transition select-none"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef, watch, nextTick } from 'vue';
import { useWorkStore } from '@/store/work';
import { useAppStore } from '@/store/app';
import { useDebounceFn, useClipboard, useInfiniteScroll } from '@vueuse/core';
import { RecycleScroller, type RecycleScrollerInstance } from 'vue-virtual-scroller';
import { driver } from 'driver.js';
import { searchByKeyword, imageUrl, virtualScrollerItems, virtualScrollerGap, type FrameGroup } from '@/works/ave/ave';
import VDialog from '@/components/VDialog.vue';
import VSlider from '@/components/VSlider.vue';
import { useFlyToAnimation } from '@/composable/useFlyToAnimation';
import { maxFrameGroups } from '@/constant';
import InfoDialog from '@/components/InfoDialog.vue';

const searchText = ref('');
const dialogOpen = ref(false);
const selectedFrameGroup = ref<FrameGroup>();
const searchResult = ref<FrameGroup[]>([]);
const searchResultShouldDisplay = ref<FrameGroup[]>([]);
const slideValue = ref<number>(0);
const searchResultContainer = useTemplateRef('searchResultContainer');
const vScroller = useTemplateRef<RecycleScrollerInstance>('vScroller');
const animeButtonRef = ref<HTMLElement | null>(null);
const showAddedAnimation = ref(false);
const tooltipVisible = ref(false);
const tooltipStyle = ref({ top: '0px', left: '0px' });
const isShowEmptyMessage = ref(false);

const workStore = useWorkStore();
const appStore = useAppStore();
const { copy } = useClipboard();

const searchDebounce = useDebounceFn(search, 500);

const perLoadLength = 12;
let searchLoadIndex = 0;
const { reset: resetInfiniteScroll } = useInfiniteScroll(
  searchResultContainer,
  () => {
    const start = searchLoadIndex * perLoadLength;
    const newChunk = searchResult.value.slice(start, start + perLoadLength);
    searchResultShouldDisplay.value.push(...newChunk);
    ++searchLoadIndex;
  },
  {
    canLoadMore: () => searchResultShouldDisplay.value.length < searchResult.value.length,
  },
);

function search() {
  const keyword = searchText.value;
  if (keyword === '') {
    searchResult.value = [];
    return;
  }
  resetSearch();
  searchResult.value = searchByKeyword(keyword);

  if (searchResult.value.length === 0) {
    isShowEmptyMessage.value = true;
  }

  // GA track
  if (import.meta.env.PROD) {
    gtag('event', 'search', {
      value: keyword,
    });
  }
}

const frameGroupByEpisode = computed(() => {
  if (!selectedFrameGroup.value) return [];

  return virtualScrollerItems(selectedFrameGroup.value.ep);
});

const selectedFrameGroupIndex = computed(() => {
  if (!selectedFrameGroup.value) return -1;
  return frameGroupByEpisode.value.findIndex((item) => item.id === selectedFrameGroup.value?.id);
});

function resetSearch() {
  isShowEmptyMessage.value = false;
  searchResult.value = [];
  searchResultShouldDisplay.value = [];
  resetInfiniteScroll();
  searchLoadIndex = 0;
}

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  img.classList.add('border-3');
}

function onImageClick(frameGroup: FrameGroup) {
  dialogOpen.value = true;
  selectedFrameGroup.value = frameGroup;
  slideValue.value = frameGroup.start;
  // GA track
  if (import.meta.env.PROD) {
    gtag('event', 'click', {
      value: `${frameGroup.id}_${frameGroup.text}`,
    });
  }
}

function onVScrollerVisible() {
  if (!vScroller.value) return;
  vScroller.value.scrollToItem(selectedFrameGroupIndex.value);
}

function onWheel(event: WheelEvent) {
  const target = event.currentTarget as HTMLElement;
  target.scrollLeft += event.deltaY; // Y 軸滾動影響 X 軸
  event.preventDefault(); // 阻止 Y 軸滾動
}

function onScrollerItemClick(item: FrameGroup) {
  selectedFrameGroup.value = item;
  slideValue.value = item.start;
}

const { flyToAnimation } = useFlyToAnimation(animeButtonRef);
const isAnimating = ref(false);

async function onAddFrameGroupClick(event: Event, item: FrameGroup) {
  // 若正在動畫中，忽略此次點擊
  if (isAnimating.value) return;

  if (workStore.selectedFrameGroups.length < maxFrameGroups) {
    isAnimating.value = true;
    await flyToAnimation(event);
    workStore.selectedFrameGroups.push({ ...item, addTime: Date.now().toString() });
    workStore.originFrameGroupMap.set(item.id, { ...item });
  }
  isAnimating.value = false;
}

function copyImageUrl(e: MouseEvent) {
  if (!selectedFrameGroup.value) return;
  const url = imageUrl(selectedFrameGroup.value.ep, slideValue.value);
  copy(url);

  // 取得滑鼠位置，並設定 tooltip 顯示在滑鼠旁邊（例如偏移 10px）
  tooltipStyle.value = {
    top: `${e.clientY + 10}px`,
    left: `${e.clientX + 10}px`,
  };

  tooltipVisible.value = true;
  setTimeout(() => {
    tooltipVisible.value = false;
  }, 1000);
}

// 當素材數量增加時，顯示動畫
watch(
  () => workStore.selectedFrameGroups.length,
  (newVal, oldVal) => {
    if (newVal > oldVal) {
      showAddedAnimation.value = true;
      setTimeout(() => {
        showAddedAnimation.value = false;
      }, 500);
    }
  },
);

function startDriver() {
  const homeDriver = driver({
    popoverClass: 'driverjs-theme',
    showProgress: true,
    doneBtnText: '完成',
    nextBtnText: '繼續',
    prevBtnText: '返回',
    steps: [
      {
        element: '[data-driver="search"]',
        popover: {
          title: '搜尋',
          description: `例如我們輸入「${exampleKeyword}」`,
          onNextClick: async () => {
            if (searchText.value !== exampleKeyword) {
              searchText.value = exampleKeyword;
              search();
              await nextTick();
            }
            homeDriver.moveNext();
          },
        },
      },
      { element: '[data-driver="searchResult"]', popover: { title: '查看搜尋結果' } },
      { element: '[data-driver="searchResult_0"]', popover: { title: '點擊可放大檢視' } },
      { element: '[data-driver="searchResultAdd_0"]', popover: { title: '點擊加號加入素材庫' } },
      {
        element: '[data-driver="framesBag"]',
        popover: { title: '素材庫', description: '點擊按鈕進入素材編輯畫面' },
      },
    ],
    onDestroyed() {
      isDriverActive.value = false;
    },
  });

  homeDriver.drive();
  isDriverActive.value = true;
}
const isDriverActive = ref(false);
const exampleKeyword = '真是奇蹟';
</script>

<style scoped>
@keyframes buttonAnimation {
  0% {
    transform: scale(1);
    background-color: white;
  }
  50% {
    transform: scale(1.05);
    background-color: #ffe2e2;
  }
  100% {
    transform: scale(1);
    background-color: white;
  }
}
.animate-button {
  animation: buttonAnimation 0.5s ease-in-out;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  30% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bounceOut {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.5);
    opacity: 0;
  }
}

.tooltip-enter-active {
  animation: bounceIn 0.2s;
}

.tooltip-leave-active {
  animation: bounceOut 0.2s;
}
</style>
