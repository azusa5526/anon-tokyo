<template>
  <div class="flex flex-col gap-y-4">
    <div class="flex items-center">
      <div class="mr-4 w-16">輸出格式</div>
      <Listbox v-model="selectedFormat" class="grow">
        <div class="relative">
          <ListboxButton
            class="h-11 w-full cursor-pointer rounded bg-white pr-10 pl-4 shadow outline-1 outline-neutral-200"
          >
            <span class="block truncate text-center">{{ selectedFormat.toUpperCase() }}</span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <icon-ic-baseline-arrow-drop-down class="size-6 text-neutral-500 outline-none" />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg"
            >
              <ListboxOption
                v-slot="{ active, selected }"
                v-for="format in formats"
                :key="format"
                :value="format"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-neutral-200' : 'text-neutral-700',
                    'relative grid h-11 place-items-center px-4 py-2 select-none',
                  ]"
                >
                  <div :class="[selected ? 'font-medium' : 'font-normal', 'block truncate']">
                    {{ format.toUpperCase() }}
                  </div>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </div>

    <div class="flex items-center">
      <div class="mr-4 w-16">尺寸大小</div>
      <Listbox v-model="selectedResolution" class="grow">
        <div class="relative">
          <ListboxButton
            class="h-11 w-full cursor-pointer rounded bg-white pr-10 pl-4 shadow outline-1 outline-neutral-200"
          >
            <span class="block truncate text-center" v-if="selectedResolution">
              {{ selectedResolution.width }} x {{ selectedResolution.height }}
            </span>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <icon-ic-baseline-arrow-drop-down class="size-6 text-neutral-500 outline-none" />
            </span>
          </ListboxButton>

          <transition
            leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
          >
            <ListboxOptions
              class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded bg-white py-1 text-base shadow-lg"
            >
              <ListboxOption
                v-slot="{ active, selected }"
                v-for="[key, value] in allowedResolutions"
                :key="key"
                :value="value"
                as="template"
              >
                <li
                  :class="[
                    active ? 'bg-neutral-200' : 'text-neutral-700',
                    'relative grid h-11 cursor-default place-items-center px-4 py-2 select-none',
                  ]"
                >
                  <span :class="[selected ? 'font-bold' : 'font-normal', 'block truncate']">
                    {{ value.width }} x {{ value.height }}
                  </span>
                </li>
              </ListboxOption>
            </ListboxOptions>
          </transition>
        </div>
      </Listbox>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/vue';
import { resolutions, formats, resolutionRules, type Resolution } from '@/constant';
import { useWorkStore } from '@/store/work';

const workStore = useWorkStore();

const selectedFormat = ref<'gif' | 'webp'>('webp');
const selectedResolution = ref<Resolution>(resolutions.get('nHD') ?? { width: 640, height: 360 });

const currentRule = computed(() => {
  const rules = resolutionRules.filter((rule) => rule.format === selectedFormat.value);
  // 選出第一個滿足 outputFrames < rule.maxFrames 的規則
  return rules.find((rule) => workStore.outputFrames.length <= rule.maxFrames) || rules[rules.length - 1];
});

const allowedResolutions = computed(() => {
  const allowedKeys = currentRule.value.allowedKeys;
  return Array.from(resolutions.entries()).filter(([key]) => allowedKeys.includes(key));
});

// 當允許的解析度改變時，若目前選取的解析度不在允許範圍內，則自動選擇為當前能選的項目列表中的最後一項解析度
watch(allowedResolutions, (newAllowed) => {
  const exists = newAllowed.some(
    ([, value]) => value.width === selectedResolution.value.width && value.height === selectedResolution.value.height,
  );
  if (!exists && newAllowed.length > 0) {
    selectedResolution.value = newAllowed[newAllowed.length - 1][1];
  }
});

defineExpose({ selectedFormat, selectedResolution });
</script>
