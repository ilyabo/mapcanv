// src/App.tsx
import React from 'react';
import SVGCanvas from './SVGCanvas';

const App: React.FC = () => {
  return (
    <div className="App">
      <h1>Collaborative Drawing</h1>
      <SVGCanvas />
    </div>
  );
};

export default App;
