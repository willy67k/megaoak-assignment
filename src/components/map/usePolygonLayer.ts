import { watch, onMounted, type Ref } from "vue";
import L, { Map, GeoJSON } from "leaflet";
import { useLocationStore, type PolygonsFeature } from "@/stores/location.store";
import type { Feature, FeatureCollection, Geometry } from "geojson";

export function usePolygonLayer(map: Ref<Map>) {
  const store = useLocationStore();

  let geoJsonLayer: GeoJSON | null = null;

  function getGeoJSON(): FeatureCollection {
    const features: Feature<Geometry>[] = store.polygonFeatures.map((f: PolygonsFeature) => ({
      type: "Feature",
      geometry: {
        type: f.geometry.type,
        coordinates: f.geometry.coordinates,
      },
      properties: f.properties,
    }));

    return {
      type: "FeatureCollection",
      features,
    };
  }

  watch(
    () => store.polygonFeatures,
    (features) => {
      if (!map.value || !features || features.length === 0) return;

      if (geoJsonLayer) {
        geoJsonLayer.remove();
      }
      geoJsonLayer = L.geoJSON(getGeoJSON(), {
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
    { immediate: true }
  );

  onMounted(() => {
    if (!geoJsonLayer && map.value) {
      geoJsonLayer = L.geoJSON().addTo(map.value);
    }
  });
}
