import { watch, onBeforeUnmount, nextTick, type Ref, shallowRef } from "vue";
import L, { type Map, Marker, MarkerClusterGroup } from "leaflet";
import "leaflet.markercluster";
import { useLocationStore, type RenewalPointVM } from "@/stores/location.store";

export function useRenewalMarker(mapRef: Ref<Map | null>, filterText?: Ref<string>) {
  const store = useLocationStore();
  const markerClusterGroup = shallowRef<MarkerClusterGroup | null>(null);

  function getGroupedPoints(): Record<string, RenewalPointVM[]> {
    const groups: Record<string, RenewalPointVM[]> = {};
    const list = store.renewalPointVMs.filter((point) => (filterText?.value ? point.stopName.toLowerCase().includes(filterText.value.toLowerCase()) : true));

    list.forEach((point) => {
      if (!groups[point.stopName]) groups[point.stopName] = [];
      groups[point.stopName]!.push(point);
    });

    return groups;
  }

  let markersMap: Record<string, Marker> = {};

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

    markersMap = {};
    const grouped = getGroupedPoints();
    const markers: Marker[] = [];

    for (const name in grouped) {
      const points = grouped[name];
      if (!points || points.length === 0) continue;

      const { lat, lng } = points[0]!;
      const marker = L.marker([lat, lng]);

      (marker as any).data = {
        name,
        distance: points[0]!.distance,
      };

      markers.push(marker);
      markersMap[name] = marker;
    }

    if (markers.length > 0) {
      markerClusterGroup.value.addLayers(markers);
    }

    if (!mapRef.value.hasLayer(markerClusterGroup.value as MarkerClusterGroup)) {
      mapRef.value.addLayer(markerClusterGroup.value as MarkerClusterGroup);
    }

    markerClusterGroup.value.on("click", (e) => {
      const marker = e.layer as any;
      const data = marker.data;
      if (data) {
        L.popup({
          autoClose: true,
          closeOnClick: true,
          autoPan: true,
          offset: [0, -17],
        })
          .setLatLng(e.latlng)
          .setContent(`<strong>${data.name}</strong><br/>距離: ${data.distance.toFixed(1)} km`)
          .openOn(mapRef.value!);
      }
    });
  }

  const onZoom = () => {
    mapRef.value?.closePopup();
  };

  const setupMapEvents = () => {
    if (mapRef.value) {
      mapRef.value.off("zoomstart", onZoom);
      mapRef.value.on("zoomstart", onZoom);
    }
  };

  function openPopup(stopName: string) {
    const marker = markersMap[stopName] as any;
    if (marker && markerClusterGroup.value) {
      markerClusterGroup.value.zoomToShowLayer(marker, () => {
        const data = marker.data;
        if (data) {
          L.popup({
            autoClose: true,
            closeOnClick: true,
            autoPan: true,
            offset: [0, -17],
          })
            .setLatLng(marker.getLatLng())
            .setContent(`<strong>${data.name}</strong><br/>距離: ${data.distance.toFixed(1)} km`)
            .openOn(mapRef.value!);
        }
      });
    }
  }

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

  return { render, openPopup };
}
