<script setup lang="ts">
import { onMounted, ref, shallowRef, watch, type Ref } from "vue";
import L, { Map, type LatLngExpression } from "leaflet";
import { useLocationStore } from "@/stores/location.store";
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM, MAP_MAX_ZOOM, TILE_LAYER_URL } from "@/constants/map";
import { useUserMarker } from "./useUserMarker";
import { useRenewalMarker } from "./useRenewalMarker";
import { usePolygonLayer } from "./usePolygonLayer";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

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

const { handleError } = useErrorHandle();

watch(
  () => store.userLocation,
  () => {
    try {
      if (!map.value) return;
      const location: LatLngExpression = [store.userLocation?.lat!, store.userLocation?.lng!];
      map.value.setView(location);

      L.tileLayer(TILE_LAYER_URL).addTo(map.value);
    } catch (error) {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.MAP.TILE_LOAD_FAILED,
        error,
      });
    }
  }
);

onMounted(() => {
  try {
    map.value = L.map("map", {
      center: MAP_DEFAULT_CENTER,
      zoom: MAP_DEFAULT_ZOOM,
      maxZoom: MAP_MAX_ZOOM,
    });
    emit("updateMapRef", map);
  } catch (error) {
    handleError({
      level: "toast",
      message: ERROR_MESSAGES.MAP.INIT_FAILED,
      error,
    });
  }
});
</script>

<template>
  <div id="map" class="h-[60%]"></div>
</template>
