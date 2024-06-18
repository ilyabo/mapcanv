// src/App.tsx
import React from 'react';
import {MapView} from './MapView';
import {Menu} from './Menu';

const App: React.FC = () => {
  return (
    <>
      <div
        className="map-container absolute inset-0"
        style={{
          position: 'absolute',
          width: '100vw',
          height: '100vh',
        }}
      >
        <MapView />
      </div>
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
        }}
      >
        <Menu />
      </div>
    </>
  );
};

export default App;
