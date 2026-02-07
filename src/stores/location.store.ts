import { defineStore } from "pinia";
import { getDistanceList } from "@/api/xinbei.distance";
import { getPolygons } from "@/api/xinbei.polygon";

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

export interface PolygonsResponse {
  result: {
    crs: {
      properties: {
        name: string;
      };
      type: string;
    };
    features: PolygonsFeature[];
    name: string;
    type: string;
  };
}

export interface PolygonsFeature {
  geometry: {
    coordinates: number[][][];
    type: "Polygon";
  };
  properties: {
    SHAPE_Area: number;
    TxtMemo: string;
    分區: string;
  };
  type: string;
}

export interface RenewalPointVM {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
}

export const useLocationStore = defineStore("location", {
  state: () => ({
    userLocation: null as LatLng | null,
    renewalResponse: { result: [], tod: false } as RenewalPointResponse,
    renewalPoints: [] as RenewalPointVM[],
    polygonsResponse: {} as PolygonsResponse,
    polygonFeatures: [] as PolygonsFeature[],
    renewalLoading: false,
    renewalError: null as string | null,
    polygonsLoading: false,
    polygonsError: null as string | null,
  }),

  actions: {
    async setUserLocation(lat: number, lng: number) {
      this.userLocation = { lat, lng };
    },

    async fetchRenewalList() {
      if (!this.userLocation) return;

      this.renewalLoading = true;
      this.renewalError = null;
      try {
        const data = await getDistanceList(this.userLocation);
        this.renewalResponse = data;

        this.renewalPoints = data.result.map((item: RenewalPoint) => ({
          id: item.id,
          name: item.stop_name,
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
        this.polygonFeatures = data.result.features;
      } catch (err) {
        this.polygonsError = "Failed to fetch polygons";
      } finally {
        this.polygonsLoading = false;
      }
    },

    async initMapData(lat: number, lng: number) {
      await this.setUserLocation(lat, lng);
      await this.fetchRenewalList();
      await this.fetchPolygons();
    },

    getFilteredRenewalPoints(searchText: string) {
      if (!searchText) return this.renewalPoints;

      const lower = searchText.toLowerCase();
      return this.renewalPoints.filter((p) => p.name.toLowerCase().includes(lower) || p.id.toString() === searchText);
    },
  },
});
