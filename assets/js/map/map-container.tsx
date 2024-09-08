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
import throttle from "lodash.throttle";
import {Map} from "maplibre-gl";
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  MapRef,
  Map as ReactMapGl,
  useControl,
  ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import {useAppStore} from "../store/store";
import {colorToRGBA, findLastLabelLayerId} from "../store/utils";
import {useDrawHandler} from "./use-draw-handlers";

import {MapLayerMouseEvent} from "react-map-gl";
import MapControlsContainer from "./map-controls-container";
import {useKeyStrokes} from "./use-key-strokes";
import {usePanning} from "./use-panning";
import CustomOverlay from "./custom-overlay";
import {CursorPresenceOverlay} from "./cursor-presence-overlay";

const defaultColor: [number, number, number, number] = [150, 150, 150, 200];

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

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

export const MapContainer: FC = () => {
  const features = useAppStore((state) => state.features);
  const selectedIds = useAppStore((state) => state.selectedIds);
  const mapRef = useRef<MapRef>(null);
  const [beforeId, setBeforeId] = useState();

  const mapViewState = useAppStore((state) => state.mapViewState);
  const setMapViewState = useAppStore((state) => state.setMapViewState);

  const handleMove = useCallback((evt: ViewStateChangeEvent) => {
    setMapViewState(evt.viewState);
  }, []);

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

  const selectedFeatureIndexes = useMemo(
    () =>
      selectedIds
        ? features
            .map((f, i) => (selectedIds.includes(String(f.id)) ? i : -1))
            .filter((i) => i !== -1)
        : [],
    [features, selectedIds]
  );

  const pushCursorPresence = useAppStore((state) => state.pushCursorPresence);
  const handleMouseMove = useCallback(
    throttle((e: MapLayerMouseEvent) => pushCursorPresence(e.lngLat), 200),
    [pushCursorPresence]
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
      modeConfig: drawHandlers.modeConfig,

      getFillColor: (f) =>
        f.properties.color ? colorToRGBA(f.properties.color) : defaultColor,
      stroked: true,
      filled: true,
      lineWidthUnits: "pixels",
      getLineWidth: (f) =>
        selectedIds?.includes(f.id)
          ? SELECTION_LINE_WIDTH
          : f.geometry.type === "LineString"
          ? 3
          : 1,
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
    <div className="map-container absolute w-[100vw] h-[100vh] top-0 left-0">
      <ReactMapGl
        ref={mapRef}
        {...mapViewState}
        mapStyle={MAP_STYLE}
        antialias
        cursor="default"
        onLoad={onMapLoad}
        onMove={handleMove}
        onMouseMove={handleMouseMove}
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
        <CustomOverlay>
          <CursorPresenceOverlay />
        </CustomOverlay>
      </ReactMapGl>

      <MapControlsContainer mapRef={mapRef} />
    </div>
  );
};
