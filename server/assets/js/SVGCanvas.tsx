// src/SVGCanvas.tsx
import React, {useRef, useState, useEffect} from 'react';
import {useDrawingStore} from './store';

const SVGCanvas: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const {lines, addLine, initialize} = useDrawingStore((state) => ({
    lines: state.lines,
    addLine: state.addLine,
    initialize: state.initialize,
  }));

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleMouseDown = (event: React.MouseEvent) => {
    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    (svg as any).currentX = x;
    (svg as any).currentY = y;
    setIsDrawing(true);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDrawing) return;

    const svg = svgRef.current!;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const line = {
      x0: (svg as any).currentX,
      y0: (svg as any).currentY,
      x1: x,
      y1: y,
    };

    addLine(line);

    (svg as any).currentX = x;
    (svg as any).currentY = y;
  };

  return (
    <svg
      ref={svgRef}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      width={800}
      height={600}
      style={{border: '1px solid black'}}
    >
      {lines &&
        lines.map((line, index) => (
          <line
            key={index}
            x1={line.x0}
            y1={line.y0}
            x2={line.x1}
            y2={line.y1}
            stroke="black"
            strokeWidth="2"
          />
        ))}
    </svg>
  );
};

export default SVGCanvas;
