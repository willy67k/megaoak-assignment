import { watch, type Ref } from "vue";
import L, { Marker, Map } from "leaflet";
import { useLocationStore } from "@/stores/location.store";

export function useUserMarker(map: Ref<Map>) {
  const store = useLocationStore();
  let marker: Marker;

  watch(
    () => store.userLocation,
    (location) => {
      if (!location) return;

      if (marker) marker.remove();

      marker = L.marker([location.lat, location.lng]).addTo(map.value).bindTooltip("You are here", { permanent: true });
    },
    { immediate: true }
  );
}
