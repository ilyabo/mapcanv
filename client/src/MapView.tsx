import {
  MapboxOverlay as DeckOverlay,
  MapboxOverlayProps,
} from '@deck.gl/mapbox';
import {PolygonLayer} from 'deck.gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {FC, useEffect, useState} from 'react';
import {Map, useControl} from 'react-map-gl/maplibre';
import {Polygon, useDrawingStore} from './store';

const INITIAL_VIEW_STATE = {
  latitude: 51.47,
  longitude: 0.45,
  zoom: 1,
  bearing: 0,
  pitch: 0,
  minZoom: 1,
};

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const DOUBLE_CLICK_DELAY = 250; // Adjust the delay for double-click detection

function DeckGLOverlay(props: MapboxOverlayProps): null {
  const overlay = useControl(({map}) => {
    const mapInstance = map.getMap();
    mapInstance.doubleClickZoom.disable();
    return new DeckOverlay(props);
  });
  overlay.setProps(props);
  return null;
}

export const MapView: FC = () => {
  const {polygons, addPolygon, initialize} = useDrawingStore((state) => ({
    polygons: state.polygons,
    addPolygon: state.addPolygon,
    initialize: state.initialize,
  }));
  const [drawing, setDrawing] = useState(false);
  const [currentPolygon, setCurrentPolygon] = useState<Polygon>({vertices: []});
  const [clickTimeout, setClickTimeout] = useState<number | null>(null);

  console.log(currentPolygon);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleClick = (event) => {
    const [lng, lat] = event.coordinate;

    if (clickTimeout) {
      // Double-click detected
      clearTimeout(clickTimeout);
      setClickTimeout(null);

      if (currentPolygon.vertices.length > 2) {
        addPolygon(currentPolygon);
        setDrawing(false);
        setCurrentPolygon({vertices: []});
      }
    } else {
      // Single click detected
      setClickTimeout(
        window.setTimeout(() => {
          setClickTimeout(null);
          if (drawing) {
            setCurrentPolygon((prev) => ({
              vertices: [...prev.vertices, {x: lng, y: lat}],
            }));
          } else {
            setDrawing(true);
            setCurrentPolygon({vertices: [{x: lng, y: lat}]});
          }
        }, DOUBLE_CLICK_DELAY)
      );
    }
  };

  const layers = [
    new PolygonLayer({
      id: 'polygon-layer',
      data: polygons,
      getPolygon: (d) => d.vertices.map((v) => [v.x, v.y]),
      getFillColor: [160, 160, 180, 200],
      getLineColor: [0, 0, 0, 255],
      lineWidthMinPixels: 2,
    }),
    // new GeoJsonLayer({
    //   id: 'airports',
    //   data: AIR_PORTS,
    //   // Styles
    //   filled: true,
    //   pointRadiusMinPixels: 2,
    //   pointRadiusScale: 2000,
    //   getPointRadius: (f) => 11 - f.properties.scalerank,
    //   getFillColor: [200, 0, 80, 180],
    //   // Interactive props
    //   pickable: true,
    //   autoHighlight: true,
    //   onClick,
    //   // beforeId: 'watername_ocean' // In interleaved mode, render the layer under map labels
    // }),
  ];

  return (
    <Map initialViewState={INITIAL_VIEW_STATE} mapStyle={MAP_STYLE}>
      <DeckGLOverlay layers={layers} interleaved onClick={handleClick} />
      {/* <NavigationControl position="top-left" /> */}
    </Map>
  );
};
