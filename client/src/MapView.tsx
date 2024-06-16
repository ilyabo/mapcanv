import {
  DrawPolygonMode,
  EditableGeoJsonLayer,
} from '@deck.gl-community/editable-layers';
import {
  MapboxOverlay as DeckOverlay,
  MapboxOverlayProps,
} from '@deck.gl/mapbox';
import {Map} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {FC, useEffect, useState} from 'react';
import {Map as ReactMapGl, useControl} from 'react-map-gl/maplibre';
import {useDrawingStore} from './store';

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
  const {features, addFeature, initialize} = useDrawingStore((state) => ({
    features: state.features,
    addFeature: state.addFeature,
    initialize: state.initialize,
  }));

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
  console.log({features, drawPolygons});
  const layers = [
    new EditableGeoJsonLayer({
      id: 'editable-geojson-layer',
      data: drawPolygons,
      mode: DrawPolygonMode,
      selectedFeatureIndexes: [],
      pickable: true,

      onEdit: ({updatedData, editType, editContext}) => {
        setDrawPolygons(updatedData);
        if (editType === 'addFeature') {
          const {featureIndexes} = editContext;
          if (featureIndexes.length > 0) {
            addFeature(updatedData.features[featureIndexes[0]]);
          }
        }
      },
    }),
  ];

  return (
    <ReactMapGl
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      antialias
    >
      <DeckGLOverlay layers={layers} interleaved />
    </ReactMapGl>
  );
};
