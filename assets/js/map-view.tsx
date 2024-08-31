import {
  EditableGeoJsonLayer,
  FeatureCollection,
} from "@deck.gl-community/editable-layers";
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
import {useDrawHandler} from "./drawing/draw-handlers";
import {useAppStore} from "./store";
import {colorToRGBA, findLastLabelLayerId} from "./utils";
import {useModeKeyStrokes} from "./drawing/use-mode-keystrokes";
import {usePanning} from "./drawing/use-panning";

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

function DeckGLOverlay(props: MapboxOverlayProps): null {
  const overlay = useControl(({map}) => {
    const mapInstance = map.getMap() as Map;
    mapInstance?.dragPan.disable();
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
  const mapRef = useRef<MapRef>(null);
  const [beforeId, setBeforeId] = useState();
  useModeKeyStrokes();
  usePanning(mapRef);
  const drawHandlers = useDrawHandler({mapRef: mapRef.current});

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

  console.log("features", features);

  const layers = [
    new EditableGeoJsonLayer({
      id: "editable-geojson-layer",
      data: featureCollection,
      mode: drawHandlers.editMode,
      selectedFeatureIndexes: [],
      pickable: true,
      // @ts-ignore
      beforeId, // ensure the layer is rendered before the label layers
      onEdit: drawHandlers.onEdit,

      getFillColor: (f) =>
        f.properties.color ? colorToRGBA(f.properties.color) : defaultColor,
      stroked: false,
      filled: true,
      // getLineColor: (f) =>
      //   f.properties.color
      //     ? colorToRGBA(f.properties.color, {darker: -0.2})
      //     : defaultColor,
    }),
  ];

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
        interleaved
      />
    </ReactMapGl>
  );
};
