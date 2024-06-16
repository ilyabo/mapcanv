// src/store.ts
import create from 'zustand';
import channel from './socket';

interface Vertex {
  x: number;
  y: number;
}

export interface Polygon {
  vertices: Vertex[];
}

interface DrawingState {
  polygons: Polygon[];
  initialized: boolean;
  setPolygons: (polygons: Polygon[]) => void;
  addPolygon: (polygon: Polygon, fromServer?: boolean) => void;
  clear: () => void;
  initialize: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  polygons: [],
  initialized: false,
  setPolygons: (polygons) =>
    set({polygons: Array.isArray(polygons) ? polygons : []}),
  addPolygon: (polygon, fromServer = false) => {
    set((state) => ({polygons: [...state.polygons, polygon]}));
    if (!fromServer) {
      channel.push('draw', {polygon});
    }
  },
  clear: () => set({polygons: []}),
  initialize: () => {
    if (get().initialized) return;
    set({initialized: true});

    channel
      .join()
      .receive('ok', ({polygons}) => {
        set({polygons: Array.isArray(polygons) ? polygons : []});
      })
      .receive('error', ({reason}) => {
        console.error('failed to join', reason);
      });

    channel.on('draw', ({polygon}: {polygon: Polygon}) => {
      set((state) => ({polygons: [...state.polygons, polygon]}));
    });
  },
}));
