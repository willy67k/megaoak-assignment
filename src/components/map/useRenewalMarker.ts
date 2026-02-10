import { watch, onBeforeUnmount, nextTick, type Ref, shallowRef } from "vue";
import L, { type Map, Marker, MarkerClusterGroup } from "leaflet";
import "leaflet.markercluster";
import { useLocationStore } from "@/stores/location.store";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { POPUP_OPTIONS } from "@/constants/map";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import type { RenewalPointVM } from "@/types";

export function useRenewalMarker(mapRef: Ref<Map | null>, filterText?: Ref<string>) {
  const store = useLocationStore();
  const markerClusterGroup = shallowRef<MarkerClusterGroup | null>(null);
  const { handleError } = useErrorHandle();

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
    try {
      if (!mapRef.value) return;

      await nextTick();

      if (markerClusterGroup.value) {
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
          L.popup(POPUP_OPTIONS)
            .setLatLng(e.latlng)
            .setContent(`<strong>${data.name}</strong><br/>距離: ${data.distance.toFixed(1)} km`)
            .openOn(mapRef.value!);
        }
      });
    } catch (error) {
      handleError({
        level: "toast",
        message: ERROR_MESSAGES.MAP.MARKER_RENDER_FAILED,
        error,
      });
    }
  }

  const onZoom = () => {
    mapRef.value?.closePopup();
  };

  const setupMapEvents = () => {
    if (mapRef.value) {
      mapRef.value.on("zoomstart", onZoom);
    }
  };

  function openPopup(stopName: string) {
    try {
      const marker = markersMap[stopName] as any;
      if (marker && markerClusterGroup.value) {
        markerClusterGroup.value.zoomToShowLayer(marker, () => {
          const data = marker.data;
          if (data) {
            L.popup(POPUP_OPTIONS)
              .setLatLng(marker.getLatLng())
              .setContent(`<strong>${data.name}</strong><br/>距離: ${data.distance.toFixed(1)} km`)
              .openOn(mapRef.value!);
          }
        });
      }
    } catch (error) {
      handleError({
        level: "silent",
        message: ERROR_MESSAGES.MAP.POPUP_OPEN_FAILED,
        error,
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
      markerClusterGroup.value.clearLayers();
      mapRef.value.removeLayer(markerClusterGroup.value as MarkerClusterGroup);
    }
  });

  return { render, openPopup };
}
