import { defineStore } from "pinia";
import { getDistanceList } from "@/api/xinbei.distance";
import { getPolygons } from "@/api/xinbei.polygon";
import type { LatLng, RenewalPoint, RenewalPointResponse, RenewalPointVM, PolygonsResponse } from "@/types";
import { ERROR_MESSAGES } from "@/constants/errorMessages";

export const useLocationStore = defineStore("location", {
  state: () => ({
    userLocation: null as LatLng | null,
    selectedRenewalPoint: null as RenewalPointVM | null,
    renewalResponse: { result: [], tod: false } as RenewalPointResponse,
    renewalPointVMs: [] as RenewalPointVM[],
    polygonsResponse: {} as PolygonsResponse,
    renewalLoading: false,
    renewalError: null as string | null,
    polygonsLoading: false,
    polygonsError: null as string | null,
  }),

  actions: {
    setUserLocation(lat: number, lng: number) {
      this.userLocation = { lat, lng };
    },

    setSelectedRenewalPoint(point: RenewalPointVM | null) {
      this.selectedRenewalPoint = point;
    },

    async fetchRenewalList() {
      if (!this.userLocation) return;

      this.renewalLoading = true;
      this.renewalError = null;
      try {
        const data = await getDistanceList(this.userLocation);
        this.renewalResponse = data;

        this.renewalPointVMs = data.result.map((item: RenewalPoint) => ({
          id: item.id,
          stopName: item.stop_name,
          lat: item.latitude,
          lng: item.longitude,
          distance: item.distance,
        }));
      } catch (err) {
        this.renewalError = ERROR_MESSAGES.API.FETCH_RENEWAL_POINTS_FAILED;
        throw err;
      } finally {
        this.renewalLoading = false;
      }
    },

    async fetchPolygons() {
      this.polygonsLoading = true;
      this.polygonsError = null;
      try {
        const data = await getPolygons(import.meta.env.VITE_POLYGON_DIRECTORY);
        this.polygonsResponse = data;
      } catch (err) {
        this.polygonsError = ERROR_MESSAGES.API.FETCH_POLYGONS_FAILED;
        throw err;
      } finally {
        this.polygonsLoading = false;
      }
    },

    getFilteredRenewalPointVMs(searchText: string) {
      const list = !searchText ? this.renewalPointVMs : this.renewalPointVMs.filter((point) => point.stopName.toLowerCase().includes(searchText.toLowerCase()));
      const groups: Record<string, RenewalPointVM> = {};
      list.forEach((point) => {
        if (!groups[point.stopName]) groups[point.stopName] = point;
      });
      return Object.values(groups);
    },
  },
});
