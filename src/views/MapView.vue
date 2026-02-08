<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useLocationStore } from "@/stores/location.store";
import BaseMap from "@/components/map/BaseMap.vue";
import RenewalList from "@/components/list/RenewalList.vue";

const store = useLocationStore();
const mapRef = ref<any>(null);

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
  <div class="layout">
    <BaseMap @updateMapRef="handleMapRef" />
    <RenewalList :mapRef="mapRef" />/>
  </div>
</template>
