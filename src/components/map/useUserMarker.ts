import { watch, type Ref } from "vue";
import L, { Marker, Map, LatLng } from "leaflet";
import { useLocationStore } from "@/stores/location.store";
import { useAuthStore, type AuthUser } from "@/stores/auth.store";
import DOMPurify from "dompurify";

export function useUserMarker(map: Ref<Map>) {
  const locationStore = useLocationStore();
  const authStore = useAuthStore();
  let marker: Marker;

  watch(
    () => [locationStore.userLocation, authStore.user],
    ([location, user]) => {
      if (!location || !user) return;

      if (marker) marker.remove();
      const userAssert = user as AuthUser;
      const googleAvatar = userAssert?.google?.avatar || "";
      const googleName = userAssert?.google?.name || "";
      const facebookAvatar = userAssert?.facebook?.avatar || "";
      const facebookName = userAssert?.facebook?.name || "";

      const rawHtml = `
        <div class="flex items-center">
          <div class="text-center mr-2">
            <img src="${googleAvatar}" alt="Google" class="inline-block w-8 h-8 rounded-full mb-1" />
            <p class="text-xs">${googleName}</p>
          </div>
          <div class="text-center">
            <img src="${facebookAvatar}" alt="FB" class="inline-block w-8 h-8 rounded-full mb-1" />
            <p class="text-xs">${facebookName}</p>
          </div>
        </div>
      `;

      const safeHtml = DOMPurify.sanitize(rawHtml);

      const locationAssert = location as LatLng;
      marker = L.marker([locationAssert.lat, locationAssert.lng]).addTo(map.value).bindTooltip(safeHtml, { permanent: true, direction: "top" }).openTooltip();
    },
    { immediate: true }
  );
}
