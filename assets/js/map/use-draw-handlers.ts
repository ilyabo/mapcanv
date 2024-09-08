import {DrawHandlerContext, DrawHandlers, DrawingMode} from "./types";

import {
  DrawLineStringMode,
  DrawPolygonByDraggingMode,
  DrawPolygonMode,
  ModifyMode,
  TransformMode,
  ViewMode,
} from "@deck.gl-community/editable-layers";
import {createId} from "@paralleldrive/cuid2";
import {cellToBoundary, latLngToCell} from "h3-js";
import {useEffect} from "react";
import {useAppStore} from "../store/store";

const NOOP = () => {};
const defaultHandlers = {
  selectionTool: undefined,
  onClick: NOOP,
  onDrag: NOOP,
  onDragStart: NOOP,
  onDragEnd: NOOP,
  onEdit: ({updatedData, editType, editContext}) => {
    const {featureIndexes} = editContext;
    if (featureIndexes && featureIndexes.length > 0) {
      useAppStore
        .getState()
        .addOrUpdateFeatures(
          featureIndexes.map((index) => updatedData.features[index])
        );
    }
  },
  onSelect: ({pickingInfos}) => {
    const appState = useAppStore.getState();
    const features = appState.features;
    const selectedFeatures = pickingInfos
      .map((pi) => features[pi.index]?.id)
      .filter(Boolean);
    console.log({pickingInfos, selectedFeatures});
    appState.setSelectedIds(selectedFeatures);
  },
  modeConfig: undefined,
} satisfies Partial<DrawHandlers>;

export function useDrawHandler(context: DrawHandlerContext): DrawHandlers {
  const drawingMode = useAppStore((state) => state.mode);
  const isPanning = useAppStore((state) => state.isPanning);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);
  const drawHandlers = {
    [DrawingMode.SELECT]: useSelectHandlers(context),
    [DrawingMode.SELECT_RECT]: useSelectRectHandlers(context),
    [DrawingMode.MOVE]: useMoveHandlers(context),
    [DrawingMode.DRAW_LINE]: useLineHandlers(context),
    [DrawingMode.DRAW_POLYGON]: usePolygonHandlers(context),
    [DrawingMode.DRAW_POLYGON_FREEHAND]: usePolygonDraggingHandlers(context),
  } satisfies Record<DrawingMode, DrawHandlers>;
  useEffect(() => {
    const onKeyDown = (evt) =>
      evt.key === "Escape" && setDrawingMode(DrawingMode.SELECT);
    window.addEventListener("keydown", onKeyDown);
    const onWindowBlur = () => setDrawingMode(DrawingMode.SELECT);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, []);

  if (isPanning) {
    return {
      ...defaultHandlers,
      cursor: "grabbing",
      editMode: ViewMode,
      enableDragPan: true,
      selectionTool: undefined,
    };
  }
  return drawHandlers[drawingMode];
}

function useSelectHandlers(context: DrawHandlerContext): DrawHandlers {
  const selectedIds = useAppStore((state) => state.selectedIds);
  const setSelectedIds = useAppStore((state) => state.setSelectedIds);
  useEffect(() => {
    const onKeyDown = (evt) =>
      evt.key === "Escape" && setSelectedIds(undefined);
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
      if (object) {
        setSelectedIds([object.id]);
      } else {
        setSelectedIds(undefined);
      }
    },
    cursor: "pointer",
    editMode: selectedIds ? ModifyMode : ViewMode,
    enableDragPan: selectedIds ? false : true,
  };
}

function useSelectRectHandlers(context: DrawHandlerContext): DrawHandlers {
  const setSelectedIds = useAppStore((state) => state.setSelectedIds);
  return {
    ...defaultHandlers,
    cursor: "crosshair",
    editMode: ViewMode,
    enableDragPan: false,
    selectionTool: "rectangle",
  };
}

function useMoveHandlers(context: DrawHandlerContext): DrawHandlers {
  const setSelectedIds = useAppStore((state) => state.setSelectedIds);
  return {
    ...defaultHandlers,
    onClick: (evt) => {
      const {object} = evt;
      if (object) {
        setSelectedIds([object.id]);
      } else {
        setSelectedIds(undefined);
      }
    },
    cursor: "move",
    editMode: TransformMode,
    enableDragPan: false,
  };
}

function useLineHandlers(context: DrawHandlerContext): DrawHandlers {
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
    editMode: DrawLineStringMode,
    enableDragPan: false,
    modeConfig: {
      formatTooltip: () => "", // Hide the tooltip
    },
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

function usePolygonDraggingHandlers(context: DrawHandlerContext): DrawHandlers {
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
    editMode: DrawPolygonByDraggingMode,
    enableDragPan: false,
  };
}

// function useHexagonHandlers(context: DrawHandlerContext): DrawHandlers {
//   const color = useAppStore((state) => state.color);
//   const hexResolution = useAppStore((state) => state.hexResolution);
//   const addOrUpdateFeatures = useAppStore((state) => state.addOrUpdateFeatures);
//   const addHexagon = (event) => {
//     if (!event.coordinate) return;
//     const [lng, lat] = event.coordinate;
//     const h3 = latLngToCell(lat, lng, hexResolution);
//     const boundary = cellToBoundary(h3, true);
//     addOrUpdateFeatures([
//       {
//         id: h3,
//         type: "Feature",
//         geometry: {type: "Polygon", coordinates: [boundary]},
//         properties: {color},
//       },
//     ]);
//   };
//   return {
//     ...defaultHandlers,
//     onClick: addHexagon,
//     onDrag: addHexagon,
//     cursor: "crosshair",
//     editMode: ViewMode,
//     enableDragPan: false,
//   };
// }
