// src/App.tsx
import React, {useEffect} from 'react';
import {MapView} from './map-view';
import {Menu} from './menu';
import {ColorSelector} from './color-selector';
import {HexSizeSelector} from './hex-size-selector';
import {useAppStore} from './store';

const AppRoot: React.FC = () => {
  const initialize = useAppStore((state) => state.initialize);
  useEffect(initialize, [initialize]);

  return (
    <>
      <div className="map-container absolute w-[100vw] h-[100vh] top-0 left-0">
        <MapView />
      </div>
      <div className="absolute top-4 left-4">
        <Menu />
      </div>
      <div className="absolute top-0 right-0 p-4 flex flex-row gap-2 items-center">
        <HexSizeSelector className="w-[110px]" />
        <ColorSelector />
      </div>
    </>
  );
};

export default AppRoot;
