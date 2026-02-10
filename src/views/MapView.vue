<script setup lang="ts">
import { onMounted, ref, shallowRef } from "vue";
import { useLocationStore } from "@/stores/location.store";
import BaseMap from "@/components/map/BaseMap.vue";
import RenewalList from "@/components/list/RenewalList.vue";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

const store = useLocationStore();
const mapRef = shallowRef<any>(null);
const baseMapRef = ref<InstanceType<typeof BaseMap> | null>(null);

function handleMapRef(refVal: any) {
  mapRef.value = refVal;
}

const { handleError } = useErrorHandle();

onMounted(() => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        store.setUserLocation(pos.coords.latitude, pos.coords.longitude);
        await Promise.allSettled([store.fetchRenewalList(), store.fetchPolygons()]);
      } catch (error) {
        handleError({
          level: "toast",
          message: ERROR_MESSAGES.API.FETCH_DATA_FAILED,
          error,
        });
      }
    },
    (error) => {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.MAP.LOCATION_GET_FAILED,
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
