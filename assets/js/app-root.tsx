// src/App.tsx
import React from 'react';
import {MapView} from './map-view';
import {Menu} from './menu';
import {ColorSelector} from './color-selector';

const AppRoot: React.FC = () => {
  return (
    <>
      <div className="map-container absolute inset-0">
        <MapView />
      </div>
      <div className="absolute top-4 left-4">
        <Menu />
      </div>
      <div className="absolute top-0 right-0 p-4">
        <ColorSelector />
      </div>
    </>
  );
};

export default AppRoot;
