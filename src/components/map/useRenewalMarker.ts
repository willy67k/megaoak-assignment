import { ref, watch, onBeforeUnmount, nextTick, type Ref } from "vue";
import L, { type Map, Marker, MarkerClusterGroup, Popup } from "leaflet";
import "leaflet.markercluster";
import { useLocationStore, type RenewalPointVM } from "@/stores/location.store";

export function useRenewalMarker(mapRef: Ref<Map | null>, filterText?: Ref<string>) {
  const store = useLocationStore();
  const markerClusterGroup = ref<MarkerClusterGroup | null>(null);
  let currentPopup: { popup: Popup; marker: Marker } | null = null;

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

    if (markerClusterGroup.value) {
      markerClusterGroup.value.off("popupopen");
      markerClusterGroup.value.off("popupclose");
      markerClusterGroup.value.clearLayers();
    } else {
      markerClusterGroup.value = new MarkerClusterGroup();
      mapRef.value.addLayer(markerClusterGroup.value as MarkerClusterGroup);
    }

    const grouped = getGroupedPoints();
    const markers: Marker[] = [];

    for (const name in grouped) {
      const points = grouped[name];
      if (!points || points.length === 0) continue;

      const { lat, lng } = points[0]!;
      const marker = L.marker([lat, lng]);

      const popup = L.popup({
        autoClose: true,
        closeOnClick: true,
        autoPan: true,
      }).setContent(`<strong>${name}</strong><br/>距離: ${points[0]!.distance.toFixed(1)} km`);

      marker.bindPopup(popup);
      markers.push(marker);
    }

    if (markers.length > 0) {
      markerClusterGroup.value.addLayers(markers);
    }

    if (!mapRef.value.hasLayer(markerClusterGroup.value as MarkerClusterGroup)) {
      mapRef.value.addLayer(markerClusterGroup.value as MarkerClusterGroup);
    }
    markerClusterGroup.value.on("popupopen", (e) => {
      currentPopup = {
        popup: e.popup,
        marker: (e as any).layer as Marker,
      };
    });

    markerClusterGroup.value.on("popupclose", () => {
      currentPopup = null;
    });
  }

  const onZoom = () => {
    if (!currentPopup) return;

    if (currentPopup.popup.isOpen()) {
      currentPopup.marker.closePopup();
    }
  };

  const setupMapEvents = () => {
    if (mapRef.value) {
      mapRef.value.off("zoomstart", onZoom);
      mapRef.value.on("zoomstart", onZoom);
    }
  };

  watch(
    [() => store.renewalPointVMs.length, filterText],
    () => {
      render().then(() => {
        setupMapEvents();
      });
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    if (markerClusterGroup.value && mapRef.value) {
      mapRef.value.off("zoomstart", onZoom);
      markerClusterGroup.value.off("popupopen");
      markerClusterGroup.value.off("popupclose");
      markerClusterGroup.value.clearLayers();
      mapRef.value.removeLayer(markerClusterGroup.value as MarkerClusterGroup);
    }
  });

  return { render };
}
