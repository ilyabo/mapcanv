// src/store.ts
import {create} from 'zustand';
import {channel} from './user_socket';
import {interpolateRainbow} from 'd3';

interface Feature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    color: string;
  };
}

export enum DrawingMode {
  DRAW_HEXAGON = 'H3 Hexagons',
  DRAW_POLYGON = 'Polygons',
  // MODIFY = 'Modify',
}

interface DrawingState {
  features: Feature[];
  color: string;
  initialized: boolean;
  setFeatures: (features: Feature[]) => void;
  addFeature: (feature: Feature, fromServer?: boolean) => void;
  clear: () => void;
  initialize: () => void;
  mode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
}

export const useAppStore = create<DrawingState>((set, get) => ({
  features: [],
  color: interpolateRainbow(Math.random()),
  initialized: false,
  mode: DrawingMode.DRAW_HEXAGON,
  setDrawingMode: (mode) => set({mode}),
  setFeatures: (features) =>
    set({features: Array.isArray(features) ? features : []}),
  addFeature: (feature, fromServer = false) => {
    set((state) => ({features: [...state.features, feature]}));
    if (!fromServer) {
      channel.push('draw', {feature});
    }
  },
  clear: () => set({features: []}),
  initialize: () => {
    if (get().initialized) return;
    set({initialized: true});

    channel
      .join()
      .receive('ok', ({features}) => {
        set({features: Array.isArray(features) ? features : []});
      })
      .receive('error', ({reason}) => {
        console.error('failed to join', reason);
      });

    channel.on('draw', ({feature}: {feature: Feature}) => {
      set((state) => ({features: [...state.features, feature]}));
    });
  },
}));
