import { watch, shallowRef, type Ref } from "vue";
import L, { Map, GeoJSON } from "leaflet";
import { useLocationStore } from "@/stores/location.store";
import { useErrorHandle } from "@/composables/useErrorHandle";

export function usePolygonLayer(map: Ref<Map>) {
  const store = useLocationStore();
  const geoJsonLayerRef = shallowRef<GeoJSON | null>(null);
  const { handleError } = useErrorHandle();

  watch(
    () => store.polygonsResponse,
    (response) => {
      const features = response?.result?.features;
      if (!map.value || !features || features.length === 0) return;

      if (geoJsonLayerRef.value) {
        geoJsonLayerRef.value.remove();
      }
      try {
        geoJsonLayerRef.value = L.geoJSON(store.polygonsResponse.result, {
          style: {
            color: "#2AD8A2",
            weight: 2,
            fillOpacity: 0.2,
          },
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.TxtMemo || feature.properties?.分區;
            layer.bindTooltip(name, { sticky: true });
          },
        }).addTo(map.value);
      } catch (error) {
        handleError({
          level: "toast",
          message: "圖層載入錯誤",
          error,
        });
      }
    },
    { immediate: true, deep: true }
  );
}
