import {DeckProps} from "@deck.gl/core";
import {MapRef} from "react-map-gl/dist/esm/exports-maplibre";

import {
  EditableGeoJsonLayer,
  GeoJsonEditMode,
} from "@deck.gl-community/editable-layers";
import {
  BoxSelectIcon,
  LucideIcon,
  MousePointerIcon,
  MoveIcon,
  PencilIcon,
  PentagonIcon,
  SplineIcon,
} from "lucide-react";

export const DrawingMode = {
  SELECT: "select",
  SELECT_RECT: "select:rect",
  MOVE: "move",
  DRAW_POLYGON_FREEHAND: "draw:polygon-freehand",
  DRAW_LINE: "draw:line",
  DRAW_POLYGON: "draw:polygon",
  // DRAW_HEXAGON: "draw:hexagon",
} as const satisfies Record<string, string>;
export type DrawingMode = (typeof DrawingMode)[keyof typeof DrawingMode];

export const DRAWING_MODE_LABELS = {
  [DrawingMode.SELECT]: "Select",
  [DrawingMode.SELECT_RECT]: "Select by Rectangle",
  [DrawingMode.MOVE]: "Move Objects",
  // [DrawingMode.DRAW_HEXAGON]: "Drawing with Hexagons",
  [DrawingMode.DRAW_LINE]: "Drawing Lines",
  [DrawingMode.DRAW_POLYGON_FREEHAND]: "Drawing Polygons Freehand",
  [DrawingMode.DRAW_POLYGON]: "Drawing Polygons",
} as const satisfies Record<DrawingMode, string>;

export function getDrawingModeLabel(mode: DrawingMode): string {
  return DRAWING_MODE_LABELS[mode];
}

export const DRAWING_MODE_KEYSTROKES = {
  [DrawingMode.SELECT]: "1",
  [DrawingMode.SELECT_RECT]: "2",
  [DrawingMode.MOVE]: "3",
  [DrawingMode.DRAW_LINE]: "4",
  [DrawingMode.DRAW_POLYGON_FREEHAND]: "4",
  [DrawingMode.DRAW_POLYGON]: "5",
} as const satisfies Record<DrawingMode, string>;

export function getDrawingModeKeystroke(mode: DrawingMode): string {
  return DRAWING_MODE_KEYSTROKES[mode];
}

export const DRAWING_MODE_ICONS = {
  [DrawingMode.SELECT]: MousePointerIcon,
  [DrawingMode.SELECT_RECT]: BoxSelectIcon,
  [DrawingMode.MOVE]: MoveIcon,
  [DrawingMode.DRAW_LINE]: SplineIcon,
  [DrawingMode.DRAW_POLYGON_FREEHAND]: PencilIcon,
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
  onDragStart: DeckProps["onDragStart"];
  onDragEnd: DeckProps["onDragEnd"];
  onSelect: (info: any) => any;
  onEdit: Parameters<EditableGeoJsonLayer["getModeProps"]>[0]["onEdit"]; // EditableGeojsonLayerProps is not exported
  cursor: string;
  editMode: typeof GeoJsonEditMode;
  enableDragPan: boolean;
  selectionTool: "rectangle" | "polygon" | undefined;
  modeConfig: Record<string, any> | undefined;
};
