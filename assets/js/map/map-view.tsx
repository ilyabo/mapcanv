import {
  Color,
  EditableGeoJsonLayer,
  FeatureCollection,
  SelectionLayer,
} from "@deck.gl-community/editable-layers";
import {Layer} from "@deck.gl/core";
import {
  MapboxOverlay as DeckOverlay,
  MapboxOverlayProps,
} from "@deck.gl/mapbox";
import {MapRef, Map as ReactMapGl} from "react-map-gl/maplibre";

import {Map} from "maplibre-gl";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {useControl} from "react-map-gl/maplibre";
import {useDrawHandler} from "../drawing/use-draw-handlers";
import {useAppStore} from "../store/store";
import {colorToRGBA, findLastLabelLayerId} from "../store/utils";
import {useKeyStrokes} from "../drawing/use-key-strokes";
import {usePanning} from "../drawing/use-panning";

const defaultColor: [number, number, number, number] = [150, 150, 150, 200];

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const INITIAL_VIEW_STATE = {
  latitude: 37.77712591285937,
  longitude: -122.44379091041898,
  zoom: 12,
  bearing: 0,
  pitch: 0,
  minZoom: 1.5,
};

const EDITABLE_FEATURES_LAYER_ID = "editable-geojson-layer";
const SELECTION_LAYER_ID = "selection";
const SELECTION_LINE_WIDTH = 3;
const SELECTION_STROKE_COLOR: Color = [255, 100, 0, 255];
const SELECTION_FILL_COLOR: Color = [255, 100, 0, 50];

function DeckGLOverlay(props: MapboxOverlayProps): null {
  const overlay = useControl(({map}) => {
    const mapInstance = map.getMap() as Map;
    mapInstance.doubleClickZoom.disable();
    mapInstance.dragRotate.disable();
    mapInstance.touchPitch.disable();
    mapInstance.boxZoom.disable();
    return new DeckOverlay(props);
  });
  overlay.setProps(props);
  return null;
}

export const MapView: FC = () => {
  const features = useAppStore((state) => state.features);
  const selectedIds = useAppStore((state) => state.selectedIds);
  const mapRef = useRef<MapRef>(null);
  const [beforeId, setBeforeId] = useState();

  useKeyStrokes();
  usePanning();

  const drawHandlers = useDrawHandler({mapRef: mapRef.current});
  useEffect(() => {
    if (drawHandlers.enableDragPan) {
      mapRef.current?.getMap().dragPan.enable();
    } else {
      mapRef.current?.getMap().dragPan.disable();
    }
  }, [drawHandlers.enableDragPan]);

  const onMapLoad = useCallback(() => {
    if (!mapRef.current) return;
    setBeforeId(findLastLabelLayerId(mapRef.current.getStyle()));
  }, []);

  const featureCollection = useMemo(
    () =>
      ({
        type: "FeatureCollection",
        features: features,
      } satisfies FeatureCollection),
    [features]
  );

  // console.log("features", features);

  const selectedFeatureIndexes = useMemo(
    () =>
      selectedIds
        ? features
            .map((f, i) => (selectedIds.includes(String(f.id)) ? i : -1))
            .filter((i) => i !== -1)
        : [],
    [features, selectedIds]
  );

  const layers: Layer[] = [
    new EditableGeoJsonLayer({
      id: EDITABLE_FEATURES_LAYER_ID,
      data: featureCollection,
      mode: drawHandlers.editMode,
      selectedFeatureIndexes,
      pickable: true,
      // @ts-ignore
      beforeId, // ensure the layer is rendered before the label layers
      onEdit: drawHandlers.onEdit,

      getFillColor: (f) =>
        f.properties.color ? colorToRGBA(f.properties.color) : defaultColor,
      stroked: true,
      filled: true,
      lineWidthUnits: "pixels",
      getLineWidth: (f) =>
        selectedIds?.includes(f.id) ? SELECTION_LINE_WIDTH : 1,
      getLineColor: (f) =>
        selectedIds?.includes(f.id)
          ? SELECTION_STROKE_COLOR
          : f.properties.color
          ? colorToRGBA(f.properties.color, {darker: 0.25})
          : defaultColor,
    }),
  ];
  if (drawHandlers.selectionTool) {
    layers.push(
      new SelectionLayer({
        id: SELECTION_LAYER_ID,
        selectionType: drawHandlers.selectionTool,
        onSelect: drawHandlers.onSelect,
        layerIds: [EDITABLE_FEATURES_LAYER_ID],
        getTentativeFillColor: () => SELECTION_FILL_COLOR,
        getTentativeLineColor: () => SELECTION_STROKE_COLOR,
        lineWidth: SELECTION_LINE_WIDTH,
        lineWidthUnits: "pixels",
      })
    );
  }

  return (
    <ReactMapGl
      ref={mapRef}
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      antialias
      cursor="default"
      onLoad={onMapLoad}
    >
      <DeckGLOverlay
        layers={layers}
        getCursor={() => drawHandlers.cursor}
        onClick={drawHandlers.onClick}
        onDrag={drawHandlers.onDrag}
        onDragStart={drawHandlers.onDragStart}
        onDragEnd={drawHandlers.onDragEnd}
        interleaved
      />
    </ReactMapGl>
  );
};
