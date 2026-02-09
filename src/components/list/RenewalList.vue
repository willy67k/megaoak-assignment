<script setup lang="ts">
import { ref, computed, watch, useTemplateRef, type ShallowRef } from "vue";
import { useLocationStore } from "@/stores/location.store";
import type { RenewalPointVM } from "@/types";
import { useVirtualizer } from "@tanstack/vue-virtual";
import type { Map } from "leaflet";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

const store = useLocationStore();
const searchText = ref("");
const filteredPoints = computed(() => store.getFilteredRenewalPointVMs(searchText.value));
const containerRef = useTemplateRef("containerRef");
const { handleError } = useErrorHandle();
const props = defineProps<{
  mapRef: ShallowRef<Map> | null;
  openPopup?: (name: string) => void;
}>();

const virtualizer = useVirtualizer({
  count: filteredPoints.value.length,
  getScrollElement: () => containerRef.value,
  estimateSize: () => 80,
});

watch(filteredPoints, (newList) => {
  virtualizer.value.setOptions({ ...virtualizer.value.options, count: newList.length });
});

function flyToPoint(point: RenewalPointVM) {
  try {
    if (props.openPopup) {
      props.openPopup(point.stopName);
    } else if (props.mapRef?.value) {
      props.mapRef.value.flyTo([point.lat, point.lng]);
    } else {
      handleError({ level: "silent", message: ERROR_MESSAGES.MAP.INIT_FAILED });
    }
  } catch (error) {
    handleError({
      level: "toast",
      message: ERROR_MESSAGES.MAP.FLY_TO_FAILED,
      error,
    });
  }
}
</script>

<template>
  <div id="list" ref="wrapperRef" class="flex h-[40%] w-full flex-col bg-orange-200/10 p-4">
    <input
      ref="inputRef"
      v-model="searchText"
      type="text"
      placeholder="請輸入您要查詢的地址"
      class="mb-4 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
    />
    <div ref="containerRef" class="relative overflow-auto">
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
          <li class="flex cursor-pointer items-center justify-between bg-white px-4 py-4" @click="() => flyToPoint(filteredPoints[virtualRow.index]!)">
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
