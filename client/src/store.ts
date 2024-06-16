// src/store.ts
import create from 'zustand';
import channel from './socket';

export interface Feature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: object;
}

interface DrawingState {
  features: Feature[];
  initialized: boolean;
  setFeatures: (features: Feature[]) => void;
  addFeature: (feature: Feature, fromServer?: boolean) => void;
  clear: () => void;
  initialize: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  features: [],
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
