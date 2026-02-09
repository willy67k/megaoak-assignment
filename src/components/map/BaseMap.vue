<script setup lang="ts">
import { onMounted, ref, shallowRef, watch, type Ref } from "vue";
import L, { Map, type LatLngExpression } from "leaflet";
import { useLocationStore } from "@/stores/location.store";
import { useUserMarker } from "./useUserMarker";
import { useRenewalMarker } from "./useRenewalMarker";
import { usePolygonLayer } from "./usePolygonLayer";

const store = useLocationStore();
const map = shallowRef<Map>();
const filterText = ref("");
const emit = defineEmits(["updateMapRef"]);

useUserMarker(map as Ref<Map>);
const { openPopup } = useRenewalMarker(map as Ref<Map>, filterText);
usePolygonLayer(map as Ref<Map>);

defineExpose({
  openPopup,
});

watch(
  () => store.userLocation,
  () => {
    if (!map.value) return;
    const location: LatLngExpression = [store.userLocation?.lat!, store.userLocation?.lng!];
    map.value.setView(location);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map.value);
  }
);

onMounted(() => {
  const location: LatLngExpression = [24.97, 121.44];
  map.value = L.map("map", {
    center: location,
    zoom: 16,
    maxZoom: 18,
  });
  emit("updateMapRef", map);
});
</script>

<template>
  <div id="map" class="h-[60%]"></div>
</template>
