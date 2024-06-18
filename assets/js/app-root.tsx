// src/App.tsx
import React from 'react';
import {MapView} from './map-view';
import {Menu} from './menu';
import {ColorSelector} from './color-selector';
import {HexSizeSelector} from './hex-size-selector';

const AppRoot: React.FC = () => {
  return (
    <>
      <div className="map-container absolute w-[100vw] h-[100vh] top-0 left-0">
        <MapView />
      </div>
      <div className="absolute top-4 left-4">
        <Menu />
      </div>
      <div className="absolute top-0 right-0 p-4 flex flex-col gap-2 items-end">
        <ColorSelector />
        <HexSizeSelector className="w-[110px]" />
      </div>
    </>
  );
};

export default AppRoot;
