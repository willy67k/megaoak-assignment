import { ref, watch, onBeforeUnmount, nextTick, type Ref } from "vue";
import L, { Map, MarkerClusterGroup } from "leaflet";
import "leaflet.markercluster";
import { useLocationStore, type RenewalPointVM } from "@/stores/location.store";

export function useRenewalMarker(mapRef: Ref<Map | null>, filterText?: Ref<string>) {
  const store = useLocationStore();
  const markerClusterGroup = ref<MarkerClusterGroup | null>(null);

  function getGroupedPoints(): Record<string, RenewalPointVM[]> {
    const groups: Record<string, RenewalPointVM[]> = {};
    const list = store.renewalPointVMs.filter((point) => (filterText?.value ? point.stopName.toLowerCase().includes(filterText.value.toLowerCase()) : true));

    list.forEach((point) => {
      if (!groups[point.stopName]) groups[point.stopName] = [];
      groups[point.stopName]!.push(point);
    });

    return groups;
  }

  async function render() {
    if (!mapRef.value) return;

    await nextTick();

    if (!markerClusterGroup.value) {
      markerClusterGroup.value = L.markerClusterGroup();
      mapRef.value.addLayer(markerClusterGroup.value as MarkerClusterGroup);
    } else {
      markerClusterGroup.value.clearLayers();
    }

    const grouped = getGroupedPoints();

    for (const name in grouped) {
      const points = grouped[name];
      if (!points || points.length === 0) continue;

      const { lat, lng } = points[0]!;
      const marker = L.marker([lat, lng]);

      const popupHtml = `<strong>${name}</strong><br/>距離: ${points[0]!.distance.toFixed(1)} km`;
      marker.bindPopup(popupHtml);

      markerClusterGroup.value.addLayer(marker);
    }
  }

  watch([() => store.renewalPointVMs.length, filterText], () => render(), { immediate: true });

  onBeforeUnmount(() => {
    if (markerClusterGroup.value && mapRef.value) {
      markerClusterGroup.value.clearLayers();
      mapRef.value.removeLayer(markerClusterGroup.value as MarkerClusterGroup);
    }
  });

  return { render };
}
