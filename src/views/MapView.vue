<script setup lang="ts">
import { onMounted, ref, shallowRef } from "vue";
import { useLocationStore } from "@/stores/location.store";
import BaseMap from "@/components/map/BaseMap.vue";
import RenewalList from "@/components/list/RenewalList.vue";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import { MAP_DEFAULT_CENTER } from "@/constants/map";

const store = useLocationStore();
const mapRef = shallowRef<any>(null);
const baseMapRef = ref<InstanceType<typeof BaseMap> | null>(null);

function handleMapRef(refVal: any) {
  mapRef.value = refVal;
}

const { handleError } = useErrorHandle();

onMounted(async () => {
  try {
    await Promise.allSettled([store.fetchRenewalList(), store.fetchPolygons()]);
  } catch (error) {
    handleError({
      level: "toast",
      message: ERROR_MESSAGES.API.FETCH_DATA_FAILED,
      error,
    });
  }

  if (!navigator.geolocation) {
    handleError({
      level: "toast",
      message: ERROR_MESSAGES.MAP.USE_DEFAULT_POINT,
    });

    store.setUserLocation(MAP_DEFAULT_CENTER[0], MAP_DEFAULT_CENTER[1]);
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      store.setUserLocation(pos.coords.latitude, pos.coords.longitude);
    },
    (error) => {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.MAP.USE_DEFAULT_POINT,
        error,
      });

      store.setUserLocation(MAP_DEFAULT_CENTER[0], MAP_DEFAULT_CENTER[1]);
    },
    {
      enableHighAccuracy: false,
      timeout: 8000,
      maximumAge: 60000,
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
