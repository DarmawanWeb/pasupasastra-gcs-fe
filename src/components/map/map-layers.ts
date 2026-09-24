import type { Viewer } from "cesium";
import type { MapLayerId } from "@/types/settings";
import type { CesiumLib } from "./types";

export const MAP_LAYER_OPTIONS: readonly { id: MapLayerId; label: string }[] = [
  { id: "satellite", label: "Satelit" },
  { id: "street", label: "Jalan" },
  { id: "dark", label: "Gelap" },
];

interface TileSource {
  url: string;
  maximumLevel: number;
}

const ARCGIS = "https://server.arcgisonline.com/ArcGIS/rest/services";

/**
 * Several sources per layer are stacked (base first, then overlays such as
 * labels). Swap these URLs for an on-premise tile server in closed networks.
 */
const SOURCES: Record<MapLayerId, TileSource[]> = {
  satellite: [
    {
      url: `${ARCGIS}/World_Imagery/MapServer/tile/{z}/{y}/{x}`,
      maximumLevel: 19,
    },
  ],
  street: [
    { url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png", maximumLevel: 19 },
  ],
  dark: [
    {
      url: `${ARCGIS}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
      maximumLevel: 16,
    },
    {
      url: `${ARCGIS}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
      maximumLevel: 16,
    },
  ],
};

export function applyMapLayer(
  Cesium: CesiumLib,
  viewer: Viewer,
  layer: MapLayerId,
): void {
  viewer.imageryLayers.removeAll();
  for (const source of SOURCES[layer]) {
    viewer.imageryLayers.addImageryProvider(
      new Cesium.UrlTemplateImageryProvider({
        url: source.url,
        maximumLevel: source.maximumLevel,
      }),
    );
  }
}
