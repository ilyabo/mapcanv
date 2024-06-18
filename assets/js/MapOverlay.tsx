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
import {FC} from 'react';
import {Map} from 'maplibre-gl';
import React, {useCallback, useEffect, useState} from 'react';
import {useControl} from 'react-map-gl/maplibre';
import {DrawingMode, useAppStore} from './store';
import {hslToRgbA} from './utils';

export type MapOverlayProps = {};

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

export const MapOverlay: FC<MapOverlayProps> = (props) => {
  const {} = props;

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
    <DeckGLOverlay
      layers={layers}
      getCursor={() => 'crosshair'}
      onClick={handleClick}
      // onDrag={handleDrag}
      interleaved
    />
  );
};
