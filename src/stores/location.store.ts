import { defineStore } from "pinia";
import { getDistanceList } from "@/api/xinbei.distance";
import { getPolygons } from "@/api/xinbei.polygon";
import type { Feature, FeatureCollection } from "geojson";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RenewalPointResponse {
  result: RenewalPoint[];
  tod: boolean;
}

export interface RenewalPoint {
  distance: number;
  id: number;
  is_tod: number;
  latitude: number;
  longitude: number;
  name: string;
  radius: number;
  stop_name: string;
}

export interface RenewalPointVM {
  id: number;
  stopName: string;
  lat: number;
  lng: number;
  distance: number;
}

export interface PolygonsResponse {
  result: PolygonsResult;
}

export interface PolygonsResult extends FeatureCollection {
  crs: {
    properties: {
      name: string;
    };
    type: string;
  };
  name: string;
  features: PolygonsFeature[];
}

export interface PolygonsFeature extends Feature {
  properties: {
    SHAPE_Area: number;
    TxtMemo: string;
    分區: string;
  };
}

export const useLocationStore = defineStore("location", {
  state: () => ({
    userLocation: null as LatLng | null,
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
        this.renewalError = "Failed to fetch renewal points";
      } finally {
        this.renewalLoading = false;
      }
    },

    async fetchPolygons() {
      this.polygonsLoading = true;
      this.polygonsError = null;
      try {
        const data = await getPolygons("tucheng.json");
        this.polygonsResponse = data;
      } catch (err) {
        this.polygonsError = "Failed to fetch polygons";
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
