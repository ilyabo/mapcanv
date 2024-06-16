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
  const {features, addFeature, initialize, clientColor} = useDrawingStore(
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
      mode: DrawPolygonMode,
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

const hslToRgbA = (hsl, alpha) => {
  const hslValues = hsl.match(/(\d+(\.\d+)?)/g);
  const h = hslValues[0];
  const s = hslValues[1] / 100;
  const l = hslValues[2] / 100;
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h / 360 + 1 / 3);
    g = hue2rgb(p, q, h / 360);
    b = hue2rgb(p, q, h / 360 - 1 / 3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255),
    alpha * 255,
  ];
};
