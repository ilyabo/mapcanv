import {DrawHandlerContext, DrawHandlers, DrawingMode} from "./types";

import {
  DrawPolygonMode,
  ModifyMode,
  ViewMode,
} from "@deck.gl-community/editable-layers";
import {cellToBoundary, latLngToCell} from "h3-js";
import {useAppStore} from "../store";
import {createId} from "@paralleldrive/cuid2";
import {useEffect} from "react";

const NOOP = () => {};
const defaultHandlers = {onClick: NOOP, onDrag: NOOP, onEdit: NOOP};

export function useDrawHandler(context: DrawHandlerContext): DrawHandlers {
  const {mapRef} = context;
  const drawingMode = useAppStore((state) => state.mode);
  const isPanning = useAppStore((state) => state.isPanning);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);
  const drawHandlers = {
    [DrawingMode.SELECT]: useSelectHandlers(context),
    [DrawingMode.DRAW_POLYGON]: usePolygonHandlers(context),
    [DrawingMode.DRAW_HEXAGON]: useHexagonHandlers(context),
  } satisfies Record<DrawingMode, DrawHandlers>;
  useEffect(() => {
    const onKeyDown = (evt) =>
      evt.key === "Escape" && setDrawingMode(DrawingMode.SELECT);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (isPanning) {
    return {
      ...defaultHandlers,
      cursor: "grabbing",
      editMode: ViewMode,
      enableDragPan: true,
    };
  }
  return drawHandlers[drawingMode];
}

function useSelectHandlers(context: DrawHandlerContext): DrawHandlers {
  const selectedIds = useAppStore((state) => state.selectedIds);
  const setSelection = useAppStore((state) => state.setSelection);
  const addOrUpdateFeatures = useAppStore((state) => state.addOrUpdateFeatures);
  useEffect(() => {
    const onKeyDown = (evt) => evt.key === "Escape" && setSelection(undefined);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  return {
    ...defaultHandlers,
    onClick: (evt) => {
      const {
        object,
        // @ts-ignore
        isGuide,
      } = evt;
      if (isGuide) {
        // Clicking on a guide, e.g. a midpoint
        return;
      }
      // console.log("select", object, index);
      // setSelection(object ? [object.id] : undefined);
      if (object) {
        setSelection([object.id]);
      } else {
        setSelection(undefined);
      }
    },
    onEdit: ({updatedData, editType, editContext}) => {
      // console.log({updatedData, editType, editContext});
      const {featureIndexes} = editContext;
      if (featureIndexes && featureIndexes.length > 0) {
        addOrUpdateFeatures(
          featureIndexes.map((index) => updatedData.features[index])
        );
      }
    },
    cursor: "pointer",
    editMode: selectedIds ? ModifyMode : ViewMode,
    enableDragPan: selectedIds ? false : true,
  };
}

function usePolygonHandlers(context: DrawHandlerContext): DrawHandlers {
  const color = useAppStore((state) => state.color);
  const addOrUpdateFeatures = useAppStore((state) => state.addOrUpdateFeatures);
  return {
    ...defaultHandlers,
    onEdit: ({updatedData, editType, editContext}) => {
      switch (editType) {
        // case "addTentativePosition":  // doesn't have featureIndexes
        case "addFeature":
          const {featureIndexes} = editContext;
          if (featureIndexes && featureIndexes.length > 0) {
            addOrUpdateFeatures(
              featureIndexes.map((index) => {
                const feature = updatedData.features[index];
                if (feature.id) {
                  return feature;
                } else {
                  // New feature: Add id and color
                  return {...feature, id: createId(), properties: {color}};
                }
              })
            );
          }
          break;
      }
    },
    cursor: "crosshair",
    editMode: DrawPolygonMode,
    enableDragPan: false,
  };
}

function useHexagonHandlers(context: DrawHandlerContext): DrawHandlers {
  const color = useAppStore((state) => state.color);
  const hexResolution = useAppStore((state) => state.hexResolution);
  const addOrUpdateFeatures = useAppStore((state) => state.addOrUpdateFeatures);
  const addHexagon = (event) => {
    if (!event.coordinate) return;
    const [lng, lat] = event.coordinate;
    const h3 = latLngToCell(lat, lng, hexResolution);
    const boundary = cellToBoundary(h3, true);
    addOrUpdateFeatures([
      {
        id: h3,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [boundary],
        },
        properties: {color},
      },
    ]);
  };
  return {
    ...defaultHandlers,
    onClick: addHexagon,
    onDrag: addHexagon,
    cursor: "crosshair",
    editMode: ViewMode,
    enableDragPan: false,
  };
}
