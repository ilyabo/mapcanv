// src/App.tsx
import React from 'react';
import {MapView} from './MapView';

const App: React.FC = () => {
  return (
    <div
      className="map-container absolute inset-0"
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
      }}
    >
      <MapView />
    </div>
  );
};

export default App;
