import {MapRef, Map as ReactMapGl} from 'react-map-gl/maplibre';
import {
  DrawPolygonMode,
  EditableGeoJsonLayer,
  ViewMode,
} from '@deck.gl-community/editable-layers';
import {
  MapboxOverlay as DeckOverlay,
  MapboxOverlayProps,
} from '@deck.gl/mapbox';
import {cellToBoundary, latLngToCell} from 'h3-js';
import {FC, useRef} from 'react';
import {Map} from 'maplibre-gl';
import React, {useCallback, useEffect, useState} from 'react';
import {useControl} from 'react-map-gl/maplibre';
import {DrawingMode, useAppStore} from './store';
import {colorToRGBA, findLastLabelLayerId} from './utils';

const defaultColor: [number, number, number, number] = [150, 150, 150, 200];

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

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
  const mapRef = useRef<MapRef>();
  const [beforeId, setBeforeId] = useState();

  const hexResolution = useAppStore((state) => state.hexResolution);
  const drawingMode = useAppStore((state) => state.mode);
  const [isPanning, setIsPanning] = useState(false);
  const color = useAppStore((state) => state.color);

  const {features, addFeature} = useAppStore((state) => ({
    features: state.features,
    addFeature: state.addFeature,
  }));

  const onMapLoad = useCallback(() => {
    if (!mapRef.current) return;
    setBeforeId(findLastLabelLayerId(mapRef.current.getStyle()));
  }, []);

  // add space keyboard event listener
  useEffect(() => {
    const onKeyDown = (evt) => {
      if (evt.key === ' ') {
        mapRef.current?.getMap().dragPan.enable();
        setIsPanning(true);
      }
    };
    const onKeyUp = (evt) => {
      if (evt.key === ' ') {
        mapRef.current?.getMap().dragPan.disable();
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    setDrawPolygons({type: 'FeatureCollection', features: features});
  }, [features]);

  const [drawPolygons, setDrawPolygons] = useState({
    type: 'FeatureCollection',
    features: features,
  });

  const layers = [
    new EditableGeoJsonLayer({
      id: 'editable-geojson-layer',
      data: drawPolygons,
      mode:
        drawingMode === DrawingMode.DRAW_POLYGON
          ? DrawPolygonMode
          : drawingMode === DrawingMode.DRAW_HEXAGON
          ? ViewMode
          : ViewMode,
      selectedFeatureIndexes: [],
      pickable: true,
      beforeId: beforeId,
      onEdit: ({updatedData, editType, editContext}) => {
        setDrawPolygons(updatedData);
        if (editType === 'addFeature') {
          const {featureIndexes} = editContext;
          if (featureIndexes.length > 0) {
            addFeature({
              ...updatedData.features[featureIndexes[0]],
              properties: {color},
            });
          }
        }
      },

      getFillColor: (f) =>
        f.properties.color ? colorToRGBA(f.properties.color) : defaultColor,
      getLineColor: (f) =>
        f.properties.color
          ? colorToRGBA(f.properties.color, {darker: -0.2})
          : defaultColor,
    }),
  ];
  // console.log(features);

  const handleAddHexagon = useCallback(
    (event) => {
      const [lng, lat] = event.coordinate;
      const h3 = latLngToCell(lat, lng, hexResolution);
      const boundary = cellToBoundary(h3, true);
      addFeature({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [boundary],
        },
        properties: {color},
      });
    },
    [addFeature, color, hexResolution]
  );

  const handleClick = useCallback(
    (event) => {
      if (isPanning) return;
      if (drawingMode === DrawingMode.DRAW_HEXAGON) {
        handleAddHexagon(event);
      }
    },
    [drawingMode, isPanning, handleAddHexagon]
  );

  const handleDrag = useCallback(
    (event) => {
      if (isPanning) return;
      if (drawingMode === DrawingMode.DRAW_HEXAGON) {
        handleAddHexagon(event);
      }
    },
    [drawingMode, isPanning, handleAddHexagon]
  );

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
        getCursor={() => (isPanning ? 'grab' : 'crosshair')}
        onClick={handleClick}
        onDrag={handleDrag}
        interleaved
      />
    </ReactMapGl>
  );
};
