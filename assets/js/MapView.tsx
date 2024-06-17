import {
  DrawPolygonMode,
  ViewMode,
  ModifyMode,
  EditableGeoJsonLayer,
} from '@deck.gl-community/editable-layers';
import {cellToBoundary, latLngToCell} from 'h3-js';
import {
  MapboxOverlay as DeckOverlay,
  MapboxOverlayProps,
} from '@deck.gl/mapbox';
import {Map} from 'maplibre-gl';
// import 'maplibre-gl/dist/maplibre-gl.css';
import React, {FC, useCallback, useEffect, useState} from 'react';
import {Map as ReactMapGl, useControl} from 'react-map-gl/maplibre';
import {DrawingMode, useAppStore} from './store';
import {hslToRgbA} from './utils';

const INITIAL_VIEW_STATE = {
  latitude: 37.77712591285937,
  longitude: -122.44379091041898,
  zoom: 12,
  bearing: 0,
  pitch: 0,
  minZoom: 1.5,
};

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

function DeckGLOverlay(props: MapboxOverlayProps): null {
  const overlay = useControl(({map}) => {
    const mapInstance = map.getMap() as Map;
    mapInstance.doubleClickZoom.disable();
    mapInstance.dragRotate.disable();
    mapInstance.touchZoomRotate.disable();
    mapInstance.touchPitch.disable();
    mapInstance.boxZoom.disable();
    return new DeckOverlay(props);
  });
  overlay.setProps(props);
  return null;
}

export const MapView: FC = () => {
  const drawingMode = useAppStore((state) => state.mode);

  const {features, addFeature, initialize, clientColor} = useAppStore(
    (state) => ({
      features: state.features,
      addFeature: state.addFeature,
      initialize: state.initialize,
      clientColor: `hsl(${state.hue}, ${80}%, ${60}%)`,
    })
  );

  useEffect(() => {
    initialize();
  }, [initialize]);
  useEffect(() => {
    setDrawPolygons({
      type: 'FeatureCollection',
      features: features,
    });
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

      onEdit: ({updatedData, editType, editContext}) => {
        setDrawPolygons(updatedData);
        if (editType === 'addFeature') {
          const {featureIndexes} = editContext;
          if (featureIndexes.length > 0) {
            addFeature({
              ...updatedData.features[featureIndexes[0]],
              properties: {
                color: clientColor,
              },
            });
          }
        }
      },

      getFillColor: (f, isSelected, mode) =>
        f.properties.color
          ? hslToRgbA(f.properties.color, 0.8)
          : [160, 160, 180, 200],
      getLineColor: (f, isSelected, mode) =>
        f.properties.color
          ? hslToRgbA(f.properties.color, 1.0)
          : [0, 0, 0, 255],
    }),
  ];
  // console.log(features);

  const handleClick = useCallback(
    (event) => {
      if (drawingMode === DrawingMode.DRAW_HEXAGON) {
        const [lng, lat] = event.coordinate;
        const h3 = latLngToCell(lat, lng, Math.max(6, event.viewport.zoom - 2));
        const boundary = cellToBoundary(h3, true);
        addFeature({
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [boundary],
          },
          properties: {
            color: clientColor,
          },
        });
      }
    },
    [addFeature, drawingMode, clientColor]
  );

  // const handleDrag = useCallback(
  //   (event) => {
  //     if (drawingMode === DrawingMode.DRAW_HEXAGON) {
  //       const [lng, lat] = event.coordinate;
  //       const h3 = latLngToCell(lat, lng, Math.max(6, event.viewport.zoom - 3));
  //       const boundary = cellToBoundary(h3, true);
  //       addFeature({
  //         type: 'Feature',
  //         geometry: {
  //           type: 'Polygon',
  //           coordinates: [boundary],
  //         },
  //         properties: {
  //           color: clientColor,
  //         },
  //       });
  //       console.log(event);
  //       return false;
  //       //event.preventDefault();
  //     }
  //   },
  //   [addFeature, drawingMode, clientColor]
  // );

  return (
    <ReactMapGl
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      antialias
      cursor="default"
    >
      <DeckGLOverlay
        layers={layers}
        getCursor={() => 'crosshair'}
        onClick={handleClick}
        // onDrag={handleDrag}
        interleaved
      />
    </ReactMapGl>
  );
};
