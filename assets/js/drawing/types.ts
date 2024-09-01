import {DeckProps} from "@deck.gl/core";
import {MapRef} from "react-map-gl/dist/esm/exports-maplibre";

import {
  EditableGeoJsonLayer,
  GeoJsonEditMode,
} from "@deck.gl-community/editable-layers";

export enum DrawingMode {
  SELECT = "Select",
  DRAW_HEXAGON = "Draw Hexagons",
  DRAW_POLYGON = "Draw Polygons",
  // MODIFY = 'Modify',
}

export const KEYSTROKES_BY_MODE = {
  [DrawingMode.SELECT]: "1",
  [DrawingMode.DRAW_HEXAGON]: "2",
  [DrawingMode.DRAW_POLYGON]: "3",
};

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
