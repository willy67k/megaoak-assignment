<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick, onUnmounted, useTemplateRef, type Ref } from "vue";
import { useLocationStore, type RenewalPointVM } from "@/stores/location.store";
import { useVirtualizer } from "@tanstack/vue-virtual";
import type { Map } from "leaflet";

const store = useLocationStore();
const searchText = ref("");
const filteredPoints = computed(() => store.getFilteredRenewalPointVMs(searchText.value));
const containerRef = useTemplateRef("containerRef");
const wrapperRef = useTemplateRef("wrapperRef");
const inputRef = useTemplateRef("inputRef");
const containerHeight = ref(0);
const props = defineProps<{
  mapRef: Ref<Map> | null;
}>();

const virtualizer = useVirtualizer({
  count: filteredPoints.value.length,
  getScrollElement: () => containerRef.value,
  estimateSize: () => 80,
});

watch(filteredPoints, (newList) => {
  virtualizer.value.setOptions({ ...virtualizer.value.options, count: newList.length });
});

function updateContainerHeight() {
  const mapEl = document.getElementById("map");
  const inputEl = inputRef.value;
  const wrapperEl = wrapperRef.value;

  if (!mapEl || !inputEl || !wrapperEl) return;

  const wrapperStyle = getComputedStyle(wrapperEl);
  const wrapperPaddingTop = parseInt(wrapperStyle.paddingTop) || 0;
  const wrapperPaddingBottom = parseInt(wrapperStyle.paddingBottom) || 0;

  const inputStyle = getComputedStyle(inputEl);
  const inputMarginBottom = parseInt(inputStyle.marginBottom) || 0;

  const height = window.innerHeight - mapEl.offsetHeight - inputEl.offsetHeight - wrapperPaddingTop - inputMarginBottom - wrapperPaddingBottom;

  containerHeight.value = height > 0 ? height : 100;
}

function goToPoint(point: RenewalPointVM) {
  props.mapRef?.value.setView([point.lat, point.lng]);
}

onMounted(() => {
  nextTick(() => {
    updateContainerHeight();
  });

  window.addEventListener("resize", updateContainerHeight);
});

onUnmounted(() => {
  window.removeEventListener("resize", updateContainerHeight);
});
</script>

<template>
  <div ref="wrapperRef" class="w-full bg-orange-200/10 p-4">
    <input
      ref="inputRef"
      v-model="searchText"
      type="text"
      placeholder="請輸入您要查詢的地址"
      class="mb-4 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
    />
    <div ref="containerRef" :style="{ height: containerHeight + 'px' }" class="relative overflow-auto">
      <div v-if="!store.renewalLoading && !store.renewalError" :style="{ height: virtualizer.getTotalSize() + 'px', position: 'relative' }">
        <div
          v-for="virtualRow in virtualizer.getVirtualItems()"
          :key="filteredPoints[virtualRow.index]!.id"
          :style="{
            position: 'absolute',
            top: virtualRow.start + 'px',
            width: '100%',
          }"
        >
          <li class="flex cursor-pointer items-center justify-between bg-white px-4 py-4" @click="() => goToPoint(filteredPoints[virtualRow.index]!)">
            <p class="text-xl font-bold text-gray-800">{{ filteredPoints[virtualRow.index]!.stopName }}</p>
            <p class="text font-bold text-blue-700/60">
              <span class="mr-2 text-3xl">{{ filteredPoints[virtualRow.index]!.distance.toFixed(1) }}</span>
              <span class="text-base">km</span>
            </p>
          </li>
        </div>
      </div>
      <div v-if="store.renewalLoading" class="py-2 text-center text-gray-500">Loading...</div>
      <div v-if="store.renewalError" class="py-2 text-center text-red-500">{{ store.renewalError }}</div>
    </div>
  </div>
</template>
