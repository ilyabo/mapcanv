// src/store.ts
import {FeatureOf, Polygon} from "@deck.gl-community/editable-layers";
import {interpolateRainbow, rgb} from "d3";
import {create} from "zustand";
import {channel} from "./user_socket";
import {DrawingMode} from "./drawing/types";

export type PolygonFeature = FeatureOf<Polygon>;

interface DrawingState {
  features: PolygonFeature[];
  isPanning: boolean;
  color: string;
  selectedIds: string[] | undefined;
  setColor: (color: string) => void;
  setSelection: (ids: string[] | undefined) => void;
  initialized: boolean;
  // setFeatures: (features: PolygonFeature[]) => void;
  setPanning: (isPanning: boolean) => void;
  updateFeaturesByIndexes: (
    features: PolygonFeature[],
    indexes: number[]
  ) => void;
  addOrUpdateFeature: (feature: PolygonFeature, fromServer?: boolean) => void;
  clear: () => void;
  initialize: () => void;
  mode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  hexResolution: number;
  setHexResolution: (resolution: number) => void;
}

export const useAppStore = create<DrawingState>((set, get) => ({
  features: [],
  color: rgb(interpolateRainbow(Math.random())).formatHex(),
  initialized: false,
  selectedIds: undefined,
  mode: DrawingMode.SELECT,
  selectedIndexes: undefined,
  hexResolution: 10,
  isPanning: false,
  setColor: (color) => set({color}),
  setHexResolution: (resolution) => set({hexResolution: resolution}),
  setDrawingMode: (mode) => set({mode}),
  setPanning: (isPanning) => set({isPanning}),
  // setFeatures: (features) =>
  //   set({features: Array.isArray(features) ? features : []}),

  setSelection: (ids) => {
    set({selectedIds: ids});
  },

  updateFeaturesByIndexes: (updatedFeatures, indexes) => {
    set((state) => ({
      features: updatedFeatures,
    }));
    for (const index of indexes) {
      channel.push("draw", {feature: updatedFeatures[index]});
    }
  },

  addOrUpdateFeature: (feature, fromServer = false) => {
    const {features} = get();
    if (features.find((f) => f.id === feature.id)) {
      // Update the feature
      set((state) => ({
        features: state.features.map((f) =>
          f.id === feature.id ? feature : f
        ),
      }));
    } else {
      // Add the new feature
      set((state) => ({features: [...state.features, feature]}));
    }
    if (!fromServer) {
      channel.push("draw", {feature});
    }
  },
  clear: () => set({features: []}),
  initialize: () => {
    if (get().initialized) return;
    set({initialized: true});
    channel
      .join()
      .receive("ok", ({features}) => {
        set({features: Array.isArray(features) ? features : []});
      })
      .receive("error", ({reason}) => {
        console.error("failed to join", reason);
      });

    channel.on("draw", ({feature}: {feature: PolygonFeature}) => {
      // set((state) => ({features: [...state.features, feature]}));
      console.log("draw", feature);
      get().addOrUpdateFeature(feature, true);
    });
  },
}));
