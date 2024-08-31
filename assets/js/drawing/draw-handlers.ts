import {DrawHandlerContext, DrawHandlers, DrawingMode} from "./types";

import {DrawPolygonMode, ViewMode} from "@deck.gl-community/editable-layers";
import {cellToBoundary, latLngToCell} from "h3-js";
import {useAppStore} from "../store";
import {createId} from "@paralleldrive/cuid2";

const NOOP = () => {};
const defaultHandlers = {onClick: NOOP, onDrag: NOOP, onEdit: NOOP};

export function useDrawHandler(context: DrawHandlerContext): DrawHandlers {
  const drawingMode = useAppStore((state) => state.mode);
  const isPanning = useAppStore((state) => state.isPanning);
  const handlers = {
    [DrawingMode.SELECT]: useSelectHandlers(context),
    [DrawingMode.DRAW_POLYGON]: usePolygonHandlers(context),
    [DrawingMode.DRAW_HEXAGON]: useHexagonHandlers(context),
  } satisfies Record<DrawingMode, DrawHandlers>;
  if (isPanning) {
    return {...defaultHandlers, cursor: "grabbing", editMode: ViewMode};
  }
  return handlers[drawingMode];
}

function useSelectHandlers(context: DrawHandlerContext): DrawHandlers {
  return {
    ...defaultHandlers,
    cursor: "pointer",
    editMode: ViewMode,
  };
}

function usePolygonHandlers(context: DrawHandlerContext): DrawHandlers {
  const color = useAppStore((state) => state.color);
  const updateFeaturesByIndexes = useAppStore(
    (state) => state.updateFeaturesByIndexes
  );

  return {
    ...defaultHandlers,
    onEdit: ({updatedData, editType, editContext}) => {
      switch (editType) {
        // case "addTentativePosition":  // doesn't have featureIndexes
        case "addFeature":
          const {featureIndexes} = editContext;
          if (featureIndexes && featureIndexes.length > 0) {
            const nextFeatures = updatedData.features.map((feature, index) => {
              if (feature.id) {
                return feature;
              }
              return {...feature, id: createId(), properties: {color}};
            });
            updateFeaturesByIndexes(nextFeatures, featureIndexes);
          }
          break;
      }
    },
    cursor: "crosshair",
    editMode: DrawPolygonMode,
  };
}

function useHexagonHandlers(context: DrawHandlerContext): DrawHandlers {
  const color = useAppStore((state) => state.color);
  const hexResolution = useAppStore((state) => state.hexResolution);
  const addOrUpdateFeature = useAppStore((state) => state.addOrUpdateFeature);
  const addHexagon = (event) => {
    if (!event.coordinate) return;
    const [lng, lat] = event.coordinate;
    const h3 = latLngToCell(lat, lng, hexResolution);
    const boundary = cellToBoundary(h3, true);
    addOrUpdateFeature({
      id: h3,
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [boundary],
      },
      properties: {color},
    });
  };
  return {
    ...defaultHandlers,
    onClick: addHexagon,
    onDrag: addHexagon,
    cursor: "crosshair",
    editMode: ViewMode,
  };
}
