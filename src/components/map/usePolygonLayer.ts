import { watch, onMounted, ref, type Ref } from "vue";
import L, { Map, GeoJSON } from "leaflet";
import { useLocationStore } from "@/stores/location.store";

export function usePolygonLayer(map: Ref<Map>) {
  const store = useLocationStore();
  const geoJsonLayerRef: Ref<GeoJSON | null> = ref(null);

  watch(
    () => store.polygonsResponse,
    (response) => {
      const features = response?.result?.features;
      if (!map.value || !features || features.length === 0) return;

      if (geoJsonLayerRef.value) {
        geoJsonLayerRef.value.remove();
      }
      geoJsonLayerRef.value = L.geoJSON(store.polygonsResponse.result, {
        style: {
          color: "#2AD8A2",
          weight: 2,
          fillOpacity: 0.2,
        },
        onEachFeature: (feature, layer) => {
          const name = feature.properties?.TxtMemo || feature.properties?.分區 || "Polygon";
          layer.bindTooltip(name, { sticky: true });
        },
      }).addTo(map.value);
    },
    { immediate: true, deep: true }
  );

  onMounted(() => {
    if (!geoJsonLayerRef.value && map.value) {
      geoJsonLayerRef.value = L.geoJSON().addTo(map.value);
    }
  });
}
