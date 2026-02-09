import type { Feature, FeatureCollection } from "geojson";

export interface LatLng {
  lat: number;
  lng: number;
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

export interface RenewalPointResponse {
  result: RenewalPoint[];
  tod: boolean;
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
