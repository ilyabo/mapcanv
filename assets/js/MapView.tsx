import React, {FC} from 'react';
import {Map as ReactMapGl} from 'react-map-gl/maplibre';
import {MapOverlay} from './MapOverlay';

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

export const MapView: FC = () => {
  return (
    <ReactMapGl
      initialViewState={INITIAL_VIEW_STATE}
      mapStyle={MAP_STYLE}
      antialias
      cursor="default"
    >
      <MapOverlay />
    </ReactMapGl>
  );
};
