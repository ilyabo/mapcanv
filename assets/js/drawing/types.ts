import {DeckProps} from "@deck.gl/core";
import {MapRef} from "react-map-gl/dist/esm/exports-maplibre";

import {
  EditableGeoJsonLayer,
  GeoJsonEditMode,
} from "@deck.gl-community/editable-layers";
import {
  LucideIcon,
  MousePointerIcon,
  PencilIcon,
  PentagonIcon,
} from "lucide-react";

export const DrawingMode = {
  SELECT: "select",
  DRAW_HEXAGON: "draw:hexagon",
  DRAW_POLYGON: "draw:polygon",
} as const satisfies Record<string, string>;
export type DrawingMode = (typeof DrawingMode)[keyof typeof DrawingMode];

export const DRAWING_MODE_LABELS = {
  [DrawingMode.SELECT]: "Select",
  [DrawingMode.DRAW_HEXAGON]: "Draw Hexagon",
  [DrawingMode.DRAW_POLYGON]: "Draw Polygon",
} as const satisfies Record<DrawingMode, string>;

export function getDrawingModeLabel(mode: DrawingMode): string {
  return DRAWING_MODE_LABELS[mode];
}

export const DRAWING_MODE_KEYSTROKES = {
  [DrawingMode.SELECT]: "1",
  [DrawingMode.DRAW_HEXAGON]: "2",
  [DrawingMode.DRAW_POLYGON]: "3",
} as const satisfies Record<DrawingMode, string>;

export function getDrawingModeKeystroke(mode: DrawingMode): string {
  return DRAWING_MODE_KEYSTROKES[mode];
}

export const DRAWING_MODE_ICONS = {
  [DrawingMode.SELECT]: MousePointerIcon,
  [DrawingMode.DRAW_HEXAGON]: PencilIcon,
  [DrawingMode.DRAW_POLYGON]: PentagonIcon,
} as const satisfies Record<DrawingMode, LucideIcon>;

export function getDrawingModeIcon(mode: DrawingMode): LucideIcon {
  return DRAWING_MODE_ICONS[mode];
}

export type DrawHandlerContext = {
  mapRef: MapRef | null;
};

export type DrawHandlers = {
  onClick: DeckProps["onClick"];
  onDrag: DeckProps["onDrag"];
  onEdit: Parameters<EditableGeoJsonLayer["getModeProps"]>[0]["onEdit"]; // EditableGeojsonLayerProps is not exported
  cursor: string;
  editMode: typeof GeoJsonEditMode;
  enableDragPan: boolean;
};
