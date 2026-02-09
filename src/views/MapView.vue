<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import { useLocationStore } from "@/stores/location.store";
import BaseMap from "@/components/map/BaseMap.vue";
import RenewalList from "@/components/list/RenewalList.vue";
import { useErrorHandle } from "@/composables/useErrorHandle";

const store = useLocationStore();
const mapRef = shallowRef<any>(null);
const baseMapRef = shallowRef<InstanceType<typeof BaseMap> | null>(null);

function handleMapRef(refVal: any) {
  mapRef.value = refVal;
}

const { handleError } = useErrorHandle();

onMounted(() => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        store.setUserLocation(pos.coords.latitude, pos.coords.longitude);
        await store.fetchRenewalList();
        await store.fetchPolygons();
      } catch (error) {
        handleError({
          level: "toast",
          message: "API 獲取資料失敗",
          error,
        });
      }
    },
    (error) => {
      handleError({
        level: "toast",
        message: "無法取得您的位置",
        error,
      });
    }
  );
});
</script>

<template>
  <div id="layout" class="h-screen">
    <BaseMap ref="baseMapRef" @updateMapRef="handleMapRef" />
    <RenewalList :mapRef="mapRef" :openPopup="(name) => baseMapRef?.openPopup(name)" />
  </div>
</template>
