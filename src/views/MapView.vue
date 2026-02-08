<script setup lang="ts">
import { onMounted } from "vue";
import { useLocationStore } from "@/stores/location.store";
import BaseMap from "@/components/map/BaseMap.vue";
import RenewalList from "@/components/list/RenewalList.vue";

const store = useLocationStore();

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
    <BaseMap />
    <RenewalList />
  </div>
</template>
