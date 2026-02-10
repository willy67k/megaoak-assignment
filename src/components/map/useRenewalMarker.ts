import { watch, onBeforeUnmount, nextTick, type Ref, shallowRef } from "vue";
import L, { type Map, Marker, MarkerClusterGroup } from "leaflet";
import "leaflet.markercluster";
import { useLocationStore } from "@/stores/location.store";
import { useErrorHandle } from "@/composables/useErrorHandle";
import { POPUP_OPTIONS } from "@/constants/map";
import { ERROR_MESSAGES } from "@/constants/errorMessages";
import type { RenewalPointVM } from "@/types";

interface MarkerData {
  name: string;
  distance: number;
}

interface CustomMarker extends Marker {
  data?: MarkerData;
}

export function useRenewalMarker(mapRef: Ref<Map | null>, filterText?: Ref<string>) {
  const store = useLocationStore();
  const markerClusterGroup = shallowRef<MarkerClusterGroup | null>(null);
  const { handleError } = useErrorHandle();

  let markersMap: Record<string, CustomMarker> = {};

  const getPopupContent = (data: MarkerData): string => {
    return `<strong>${data.name}</strong><br/>距離: ${data.distance.toFixed(1)} km`;
  };

  const showPopup = (latlng: L.LatLngExpression, data: MarkerData) => {
    if (!mapRef.value) return;
    L.popup(POPUP_OPTIONS).setLatLng(latlng).setContent(getPopupContent(data)).openOn(mapRef.value);
  };

  const getGroupedPoints = (): Record<string, RenewalPointVM[]> => {
    const searchTerm = filterText?.value?.toLowerCase() || "";
    const list = searchTerm ? store.renewalPointVMs.filter((point) => point.stopName.toLowerCase().includes(searchTerm)) : store.renewalPointVMs;

    const groups: Record<string, RenewalPointVM[]> = {};
    list.forEach((point) => {
      if (!groups[point.stopName]) groups[point.stopName] = [];
      groups[point.stopName]!.push(point);
    });

    return groups;
  };

  const initMarkerClusterGroup = (): MarkerClusterGroup => {
    if (markerClusterGroup.value) {
      markerClusterGroup.value.clearLayers();
      return markerClusterGroup.value;
    }

    const group = new MarkerClusterGroup();

    group.on("click", (e) => {
      const marker = e.layer as CustomMarker;
      if (marker.data) {
        showPopup(e.latlng, marker.data);
      }
    });

    markerClusterGroup.value = group;
    return group;
  };

  async function render() {
    try {
      if (!mapRef.value) return;

      await nextTick();

      const group = initMarkerClusterGroup();
      markersMap = {};
      const grouped = getGroupedPoints();
      const markers: CustomMarker[] = [];

      for (const name in grouped) {
        const points = grouped[name];
        if (!points?.length) continue;

        const firstPoint = points[0]!;
        const marker = L.marker([firstPoint.lat, firstPoint.lng]) as CustomMarker;
        marker.data = {
          name,
          distance: firstPoint.distance,
        };

        markers.push(marker);
        markersMap[name] = marker;
      }

      if (markers.length > 0) {
        group.addLayers(markers);
      }

      if (!mapRef.value.hasLayer(group)) {
        mapRef.value.addLayer(group);
      }
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
      mapRef.value.off("zoomstart", onZoom);
      mapRef.value.on("zoomstart", onZoom);
    }
  };

  function openPopup(stopName: string) {
    try {
      const marker = markersMap[stopName];
      if (marker && markerClusterGroup.value) {
        markerClusterGroup.value.zoomToShowLayer(marker, () => {
          if (marker.data) {
            showPopup(marker.getLatLng(), marker.data);
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
    [() => store.renewalPointVMs.length, filterText, mapRef],
    () => {
      if (mapRef.value) {
        render().then(setupMapEvents);
      }
    },
    { immediate: true }
  );

  onBeforeUnmount(() => {
    if (mapRef.value) {
      mapRef.value.off("zoomstart", onZoom);
      if (markerClusterGroup.value) {
        markerClusterGroup.value.clearLayers();
        mapRef.value.removeLayer(markerClusterGroup.value);
      }
    }
  });

  return { render, openPopup };
}
