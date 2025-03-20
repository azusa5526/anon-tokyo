<template>
  <div class="flex h-screen w-full flex-col overflow-hidden bg-neutral-900 select-none">
    <div class="bg-mujica flex h-14 w-full shrink-0 items-center justify-end gap-x-3 px-3">
      <button
        @click="clearDialogOpen = true"
        class="grid size-10 cursor-pointer place-items-center rounded bg-white text-xl font-bold text-red-600 transition-all hover:scale-105 hover:opacity-85"
        data-driver="deleteBtn"
      >
        <icon-ic-baseline-delete-forever class="size-7" />
      </button>

      <button
        @click="downloadDialogOpen = true"
        class="text-mujica grid size-10 cursor-pointer place-items-center rounded bg-white text-xl font-bold transition-all hover:scale-105 hover:opacity-85"
        data-driver="downloadBtn"
      >
        <icon-ic-baseline-download class="size-7" />
      </button>

      <button
        @click="startDriver"
        class="text-mujica grid size-10 cursor-pointer place-items-center rounded bg-white p-1 text-xl font-bold transition-all hover:scale-105 hover:opacity-85"
      >
        <icon-ic-baseline-question-mark class="size-7" />
      </button>

      <button
        @click="onBackClick"
        class="text-mujica grid size-10 cursor-pointer place-items-center rounded bg-white text-xl font-bold transition-all hover:scale-105 hover:opacity-85"
        data-driver="returnBtn"
      >
        <icon-ic-baseline-keyboard-return class="size-7" />
      </button>
    </div>

    <div class="flex min-h-0 grow p-3">
      <div class="mr-3 flex w-82 shrink-0 flex-col bg-neutral-700 p-3" data-driver="frames">
        <draggable
          :animation="300"
          item-key="addTime"
          class="hide-scroll-bar flex h-full flex-col gap-y-2 overflow-y-scroll"
          v-model="workStore.selectedFrameGroups"
          tag="div"
          @change="onDragChange"
        >
          <template #item="{ element: frameGroup, index }">
            <div class="relative aspect-video cursor-grab select-none" :data-driver="`frameGroup_${index}`">
              <div
                class="absolute top-0 left-0 grid size-9 place-content-center bg-neutral-600/60 text-lg font-bold text-white"
              >
                {{ index + 1 }}
              </div>
              <button
                class="absolute top-0 right-0 grid size-9 cursor-pointer place-items-center bg-red-400/70 hover:bg-red-300/70"
                @click="onDelFrameGroupClick(index)"
              >
                <icon-ic-baseline-clear class="size-7 text-white"></icon-ic-baseline-clear>
              </button>
              <div class="absolute bottom-0 left-0 w-full bg-white/80 text-center">
                {{ frameGroup.start }} ~ {{ frameGroup.end }}
              </div>
              <img
                draggable="false"
                class="cursor-pointer"
                @click="
                  viewMode = 'edit';
                  onImageClick(index);
                "
                :src="imageUrl(frameGroup.ep, frameGroup.start)"
                :alt="`${frameGroup.ep} ${frameGroup.text}`"
                :title="`Ep${frameGroup.ep} ${frameGroup.text}`"
              />
            </div>
          </template>
        </draggable>

        <div
          role="button"
          class="bg-white py-1 text-center text-lg"
          :class="{ 'font-bold text-red-400': workStore.outputFrames.length > maxFrames }"
        >
          {{ workStore.outputFrames.length }} / {{ maxFrames }}
        </div>

        <div class="grid grid-cols-2 text-lg">
          <VDialog v-model="downloadDialogOpen" dialogClass="bg-white w-full max-w-[480px] max-h-full rounded-lg">
            <template #content>
              <div class="relative flex h-full flex-col items-center justify-center p-6">
                <div class="mb-8 text-xl">匯出檔案</div>
                <button
                  class="absolute top-0 right-0 cursor-pointer p-3 hover:opacity-70"
                  @click="downloadDialogOpen = false"
                >
                  <icon-ic-baseline-clear role="button" tabindex="1" class="size-7 text-gray-500 outline-none" />
                </button>

                <AnimeSpecSelector ref="animeSpecSelectorRef" class="mb-8 w-full" />

                <button
                  v-if="animeSpecSelectorRef"
                  @click="onDownloadClick(animeSpecSelectorRef.selectedFormat, animeSpecSelectorRef.selectedResolution)"
                  role="button"
                  class="flex h-11 w-full items-center justify-center rounded text-white outline-none hover:opacity-80"
                  :class="isDownloading ? 'pointer-events-none bg-neutral-400' : 'bg-mujica cursor-pointer'"
                >
                  <ImageLoadingIcon v-if="isDownloading" class="mt-0.5 mr-3 text-lg text-white" />
                  {{ downloadBtnText }}
                </button>
              </div>
            </template>
          </VDialog>

          <VDialog v-model="clearDialogOpen" dialogClass="bg-white w-full max-w-[480px] max-h-full rounded-lg">
            <template #content>
              <div class="relative flex h-full flex-col justify-center p-6">
                <div class="mt-4 mb-10 text-xl">你確定要刪除所有編修中的素材麼？</div>
                <div class="flex justify-center gap-x-4 text-white">
                  <button
                    @click="
                      onClearAll();
                      clearDialogOpen = false;
                    "
                    class="w-24 cursor-pointer rounded bg-red-600 py-2 transition-opacity hover:opacity-80"
                  >
                    刪除
                  </button>
                  <button
                    @click="clearDialogOpen = false"
                    class="w-24 cursor-pointer rounded bg-neutral-600 transition-opacity hover:opacity-80"
                  >
                    取消
                  </button>
                </div>
              </div>
            </template>
          </VDialog>
        </div>
      </div>

      <div class="flex min-h-0 grow flex-col bg-neutral-700">
        <div class="relative flex-1 overflow-hidden bg-neutral-500" data-driver="previewMode">
          <template v-if="viewMode === 'edit'">
            <img
              v-if="selectedFrameGroup && previewMode === 'full'"
              :src="
                imageUrl(
                  selectedFrameGroup.ep,
                  activeHandle === 'start' ? selectedFrameGroup.start : selectedFrameGroup.end,
                )
              "
              :alt="selectedFrameGroup.text"
              :title="selectedFrameGroup.text"
              class="h-full w-full object-contain"
              draggable="false"
            />

            <div v-if="selectedFrameGroup && previewMode === 'split'" class="grid h-full grid-rows-2">
              <img
                class="h-full w-full object-contain"
                :src="imageUrl(selectedFrameGroup.ep, selectedFrameGroup.start)"
                :alt="selectedFrameGroup.text"
                :title="selectedFrameGroup.text"
                draggable="false"
              />
              <img
                class="h-full w-full object-contain"
                :src="imageUrl(selectedFrameGroup.ep, selectedFrameGroup.end)"
                :alt="selectedFrameGroup.text"
                :title="selectedFrameGroup.text"
                draggable="false"
              />
            </div>
          </template>

          <template v-if="viewMode === 'play'" class="relative">
            <img
              v-if="workStore.outputFrames[playSlideIndex]"
              :src="imageUrl(workStore.outputFrames[playSlideIndex].ep, workStore.outputFrames[playSlideIndex].frame)"
              class="h-full w-full object-contain"
              draggable="false"
            />

            <Transition name="fade">
              <div
                v-if="workStore.isLoadingImages"
                class="absolute inset-0 grid place-items-center bg-white/50 text-lg"
              >
                <div class="w-fit rounded-full bg-black/20 px-7 py-1.5 font-bold text-gray-800">
                  {{ preloadCount }} / {{ workStore.outputFrames.length }}
                </div>
              </div>
            </Transition>
          </template>

          <div
            v-if="viewMode === 'edit'"
            class="absolute top-1/2 right-3 flex -translate-y-1/2 flex-col opacity-40 transition-opacity duration-200 hover:opacity-100"
            data-driver="viewMode"
          >
            <button
              @click="previewMode = 'full'"
              class="cursor-pointer rounded-t p-2 transition-colors"
              :class="previewMode === 'full' ? 'bg-mujica text-white' : 'bg-white'"
            >
              <icon-ic-outline-rectangle class="size-7"></icon-ic-outline-rectangle>
            </button>
            <button
              @click="previewMode = 'split'"
              class="cursor-pointer rounded-b p-2 transition-colors"
              :class="previewMode === 'split' ? 'bg-mujica text-white' : 'bg-white'"
            >
              <icon-ic-baseline-splitscreen class="size-7"></icon-ic-baseline-splitscreen>
            </button>
          </div>
        </div>

        <div class="flex h-20 w-full shrink-0 items-center px-5 md:px-10" data-driver="controlBar">
          <RangeSlider
            v-if="viewMode === 'edit'"
            :min="minmax.min"
            :max="minmax.max"
            v-model="slideValue"
            @update:modelValue="debouncedSliderUpdate"
            @handle-active="onHandleActive"
          ></RangeSlider>
          <PlaySlider
            v-show="viewMode === 'play'"
            ref="playSliderRef"
            :max-index="workStore.outputFrames.length ? workStore.outputFrames.length - 1 : 0"
            :isLoading="workStore.isLoadingImages"
            @update:current-index="(currentIndex) => (playSlideIndex = currentIndex)"
          />

          <button
            @click="onControlClick"
            class="ml-6 cursor-pointer rounded-full bg-gray-500 p-1.5"
            :class="{
              'pointer-events-none opacity-40': workStore.outputFrames.length > maxFrames || workStore.isLoadingImages,
            }"
            data-driver="playBtn"
          >
            <div v-if="workStore.isLoadingImages" class="grid size-9 place-items-center">
              <ImageLoadingIcon class="text-3xl text-white" />
            </div>
            <icon-ic-pause v-if="playSliderRef?.isPlaying" class="size-9 text-white"></icon-ic-pause>
            <icon-ic-play-arrow
              v-if="!workStore.isLoadingImages && !playSliderRef?.isPlaying"
              class="size-9 text-white"
            ></icon-ic-play-arrow>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useDebounceFn } from '@vueuse/core';
import draggable from 'vuedraggable';
import { useWorkStore } from '@/store/work';
import { klona } from 'klona/json';
import pLimit from 'p-limit';
import { driver } from 'driver.js';
import { maxFrames, speed } from '@/constant';
import { imageUrl } from '@/works/ave/ave';
import { AWebPCreator } from '@/utils/awebp';
import { downloadBlob } from '@/utils/utils';
import { useGifDownload } from '@/composable/useGifDownload';
import VDialog from '@/components/VDialog.vue';
import RangeSlider from '@/components/RangeSlider.vue';
import PlaySlider from '@/components/PlaySlider.vue';
import AnimeSpecSelector from '@/components/AnimeSpecSelector.vue';
import ImageLoadingIcon from '@/components/ImageLoadingIcon.vue';

const workStore = useWorkStore();
const router = useRouter();

const slideValue = ref<[number, number]>([0, 0]);
const selectedFrameGroupIndex = ref<number | undefined>();
const previewMode = ref<'full' | 'split'>('full');
const playSlideIndex = ref(0);
const playSliderRef = ref<InstanceType<typeof PlaySlider> | null>(null);
const downloadDialogOpen = ref(false);
const clearDialogOpen = ref(false);
const animeSpecSelectorRef = ref<InstanceType<typeof AnimeSpecSelector>>();

const selectedFrameGroup = computed(() => {
  if (typeof selectedFrameGroupIndex.value !== 'number') return undefined;
  return workStore.selectedFrameGroups[selectedFrameGroupIndex.value];
});
const minmax = computed(() => {
  const originFrameGroup = selectedFrameGroup.value
    ? workStore.originFrameGroupMap.get(selectedFrameGroup.value.id)
    : null;

  const extendFrames = originFrameGroup ? Math.max(originFrameGroup.end - originFrameGroup.start, 96) : 0;

  return {
    min: (originFrameGroup?.start ?? 0) - extendFrames,
    max: (originFrameGroup?.end ?? 0) + extendFrames,
  };
});
const downloadBtnText = computed(() => {
  if (workStore.isLoadingImages) return `下載影像中...(${preloadCount.value} / ${workStore.outputFrames.length})`;
  if (isRenderingAnime.value) return '輸出影像中...';
  return '下載檔案';
});
const isDownloading = computed(() => {
  return workStore.isLoadingImages || isRenderingAnime.value;
});

function onDelFrameGroupClick(index: number) {
  if (index >= 0 && index < workStore.selectedFrameGroups.length) {
    workStore.selectedFrameGroups.splice(index, 1);

    if (workStore.selectedFrameGroups.length) {
      onImageClick(0);
    } else {
      selectedFrameGroupIndex.value = undefined;
      slideValue.value = [0, 0];
    }
    playSliderRef.value?.reset();
  }
}

function onImageClick(index: number) {
  selectedFrameGroupIndex.value = index;
  if (selectedFrameGroup.value) {
    slideValue.value = [selectedFrameGroup.value.start, selectedFrameGroup.value.end];
  }
  // 點擊 image 時，若正在播放，則停止、重置播放器
  if (playSliderRef?.value?.isPlaying) playSliderRef.value.reset();
}

function onClearAll() {
  workStore.selectedFrameGroups = [];
  workStore.originFrameGroupMap.clear();
  selectedFrameGroupIndex.value = undefined;
  slideValue.value = [0, 0];
}

const debouncedSliderUpdate = useDebounceFn((value: [number, number]) => {
  if (!selectedFrameGroup.value) return;
  selectedFrameGroup.value.start = value[0];
  selectedFrameGroup.value.end = value[1];
}, 500);

const preloadCount = ref(0);
async function loadImages(concurrency: number = 6) {
  if (!workStore.outputFrames.length || workStore.outputFrames.length > maxFrames) return;

  preloadCount.value = 0;
  workStore.isLoadingImages = true;

  const limit = pLimit(concurrency);
  const preloadTasks = workStore.outputFrames.map((outputFrame) => {
    return limit(async () => {
      const res = await requestImage(imageUrl(outputFrame.ep, outputFrame.frame));
      preloadCount.value++;
      return res;
    });
  });

  const results = await Promise.all(preloadTasks);
  workStore.isLoadingImages = false;
  preloadCount.value = 0;

  return results;
}

function requestImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(null);
    img.src = url;
  });
}

const { getGifBlob } = useGifDownload();
const isRenderingAnime = ref(false);

async function onDownloadClick(type: 'gif' | 'webp', resolution: { width: number; height: number }) {
  const imgs = await loadImages();
  if (!imgs?.length) return;

  let blob;
  try {
    isRenderingAnime.value = true;
    switch (type) {
      case 'webp':
        const webpCreator = new AWebPCreator({ width: resolution.width, height: resolution.height });
        imgs.forEach((img) => webpCreator.addFrame({ data: webpCreator.toUint8Array(img!), duration: speed }));
        blob = await webpCreator.toBlob();
        webpCreator.destroy();
        break;
      case 'gif':
        blob = await getGifBlob(imgs, { scaleWidth: resolution.width, scaleHeight: resolution.height, speed });
        break;
    }
  } catch (err) {
    console.error(err);
    // GA track
    if (import.meta.env.PROD) {
      gtag('event', 'exception', {
        fileType: type,
        resolution: `${resolution.width}x${resolution.height}`,
        description: `製造動圖時發生異常 ${err}`,
        fatal: true,
      });
    }
  }

  if (blob) downloadBlob(blob, `anime.${type}`);
  isRenderingAnime.value = false;

  // GA track
  if (import.meta.env.PROD && blob) {
    gtag('event', 'downlaod_animated_file_success', {
      fileType: type,
      resolution: `${resolution.width}x${resolution.height}`,
      fileSize: blob.size,
      length: imgs.length,
    });
  }
}

function onDragChange(event: unknown) {
  if (isDragChangeMovedEvent(event)) {
    onImageClick(event.moved.newIndex);
    return;
  }
  console.warn('[onDragChange]: 事件處理失敗', event);
}

interface DragChangeMovedEvent {
  moved: {
    newIndex: number;
    oldIndex: number;
    element: any;
  };
}

function isDragChangeMovedEvent(event: unknown): event is DragChangeMovedEvent {
  if (typeof event !== 'object' || event === null) {
    return false;
  }

  const obj = event as Record<string, unknown>;

  if (!('moved' in obj) || typeof obj.moved !== 'object' || obj.moved === null) {
    return false;
  }

  const moved = obj.moved as Record<string, unknown>;

  return (
    'newIndex' in moved &&
    typeof moved.newIndex === 'number' &&
    'oldIndex' in moved &&
    typeof moved.oldIndex === 'number'
  );
}

const activeHandle = ref<'start' | 'end'>('start');
function onHandleActive(handle: 'left' | 'right') {
  activeHandle.value = handle === 'left' ? 'start' : 'end';
}

const viewMode = ref<'edit' | 'play'>('edit');
const lastFrameGroupsSnapshot = ref(klona(workStore.selectedFrameGroups));
async function onControlClick() {
  if (!workStore.outputFrames.length || !playSliderRef.value) return;

  viewMode.value = 'play';
  const currentSnapshot = klona(workStore.selectedFrameGroups);
  if (JSON.stringify(currentSnapshot) !== JSON.stringify(lastFrameGroupsSnapshot.value)) {
    lastFrameGroupsSnapshot.value = klona(workStore.selectedFrameGroups);
    await loadImages();
  }

  playSliderRef.value.isPlaying ? playSliderRef.value.pause() : playSliderRef.value.play(speed);
}

function onBackClick() {
  router.push({ name: 'Home' });
  viewMode.value = 'edit';
}

function startDriver() {
  const animeDriver = driver({
    popoverClass: 'driverjs-theme',
    showProgress: true,
    doneBtnText: '完成',
    nextBtnText: '繼續',
    prevBtnText: '返回',
    steps: [
      {
        element: '[data-driver="frames"]',
        popover: {
          title: '素材庫',
          description: '這裡放置等待編輯的素材',
          onNextClick: async () => {
            // 如果素材箱為空就加入範例素材
            if (workStore.selectedFrameGroups.length === 0) {
              workStore.selectedFrameGroups = [
                {
                  ep: 1,
                  start: 23465,
                  end: 23513,
                  text: '拿到門票了,真是奇蹟',
                  id: '1-23465-23513',
                  addTime: Date.now().toString(),
                },
              ];
            }
            await nextTick();
            animeDriver.moveNext();
          },
        },
      },
      {
        element: '[data-driver="frameGroup_0"]',
        popover: {
          title: '排列與選定素材',
          description: '拖動素材可以改變排列順序，點擊素材可以選定素材',
          onNextClick: async () => {
            onImageClick(0);
            await nextTick();
            animeDriver.moveNext();
          },
        },
      },
      {
        element: '[data-driver="previewMode"]',
        popover: { title: '瀏覽選定素材', description: '點擊素材後，可以瀏覽與編輯，真是奇蹟！' },
      },
      {
        element: '[data-driver="viewMode"]',
        popover: { title: '更改瀏覽模式', description: '隨喜好調整瀏覽「單張選擇幀」或同時瀏覽「首尾幀」' },
      },
      {
        element: '[data-driver="controlBar"]',
        popover: { title: '調整範圍', description: '拖動滑塊來調整選定素材的片段' },
      },
      {
        element: '[data-driver="playBtn"]',
        popover: { title: '瀏覽動畫', description: '點擊播放鍵可以瀏覽你的大作' },
      },
      {
        element: '[data-driver="downloadBtn"]',
        popover: { title: '下載動畫', description: '下載精心製作的作品，趕緊傳給祥子看看！' },
      },
      {
        element: '[data-driver="deleteBtn"]',
        popover: { title: '刪除素材', description: '解散樂團！將所有素材庫與變更全數清除' },
      },
    ],
    onDestroyed() {
      isDriverActive.value = false;
    },
  });

  animeDriver.drive();
  isDriverActive.value = true;
}

const isDriverActive = ref(false);
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
