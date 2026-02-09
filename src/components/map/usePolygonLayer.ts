import { watch, shallowRef, type Ref } from "vue";
import L, { Map, GeoJSON } from "leaflet";
import { useLocationStore } from "@/stores/location.store";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { POLYGON_STYLE } from "@/constants/map";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

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
          style: POLYGON_STYLE,
          onEachFeature: (feature, layer) => {
            const name = feature.properties?.TxtMemo || feature.properties?.分區;
            layer.bindTooltip(name, { sticky: true });
          },
        }).addTo(map.value);
      } catch (error) {
        handleError({
          level: "toast",
          message: ERROR_MESSAGES.MAP.POLYGON_LOAD_FAILED,
          error,
        });
      }
    },
    { immediate: true, deep: true }
  );
}
