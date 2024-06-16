// src/App.tsx
import React from 'react';
import {MapView} from './MapView';

import './App.css';

const App: React.FC = () => {
  return (
    <div className="map-container">
      <MapView />
    </div>
  );
};

export default App;
