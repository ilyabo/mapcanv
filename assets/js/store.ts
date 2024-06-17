// src/store.ts
import {create} from 'zustand';
import {channel} from './user_socket';

interface Vertex {
  x: number;
  y: number;
}

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

interface DrawingState {
  features: Feature[];
  hue: number | null;
  initialized: boolean;
  setFeatures: (features: Feature[]) => void;
  addFeature: (feature: Feature, fromServer?: boolean) => void;
  clear: () => void;
  initialize: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  features: [],
  hue: null,
  initialized: false,
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
      .receive('ok', ({features, hue}) => {
        set({features: Array.isArray(features) ? features : [], hue});
      })
      .receive('error', ({reason}) => {
        console.error('failed to join', reason);
      });

    channel.on('draw', ({feature}: {feature: Feature}) => {
      set((state) => ({features: [...state.features, feature]}));
    });
  },
}));
