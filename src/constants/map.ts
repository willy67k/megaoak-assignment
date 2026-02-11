export const MAP_DEFAULT_CENTER: [number, number] = [25.01637876354897, 121.53241054724356];
export const MAP_DEFAULT_ZOOM = 16;
export const MAP_MAX_ZOOM = 18;
export const MAP_FLY_TO_ZOOM = 18;

export const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

export const POLYGON_STYLE = {
  color: "#2AD8A2",
  weight: 2,
  fillOpacity: 0.2,
};

export const POPUP_OPTIONS = {
  autoClose: true,
  closeOnClick: true,
  autoPan: true,
  offset: [0, -17] as [number, number],
};
