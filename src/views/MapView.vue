<script setup lang="ts">
import { onMounted, shallowRef } from "vue";
import { useLocationStore } from "@/stores/location.store";
import BaseMap from "@/components/map/BaseMap.vue";
import RenewalList from "@/components/list/RenewalList.vue";

const store = useLocationStore();
const mapRef = shallowRef<any>(null);
const baseMapRef = shallowRef<InstanceType<typeof BaseMap> | null>(null);

function handleMapRef(refVal: any) {
  mapRef.value = refVal;
}

onMounted(() => {
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      store.setUserLocation(pos.coords.latitude, pos.coords.longitude);
      await store.fetchRenewalList();
      await store.fetchPolygons();
    },
    () => {
      alert("Failed to get location");
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
