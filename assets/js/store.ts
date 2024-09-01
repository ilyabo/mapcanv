// src/store.ts
import {FeatureOf, Polygon} from "@deck.gl-community/editable-layers";
import {interpolateRainbow, rgb} from "d3";
import {create} from "zustand";
import {channel} from "./user_socket";
import {DrawingMode} from "./drawing/types";
import * as Y from "yjs";

export type PolygonFeature = FeatureOf<Polygon>;

const ydoc = new Y.Doc();
const yfeatures = ydoc.getMap<PolygonFeature>("features");

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
  updateFeaturesFromY: () => void;
}

export const useAppStore = create<DrawingState>((set, get) => ({
  features: [], // Array of features extracted from yarray for local use (rendering)
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

  // Method to update features from yarray
  updateFeaturesFromY: () => {
    const features = Array.from(yfeatures.values());
    console.log("updateFeaturesFromY");
    return set({features});
  },

  updateFeaturesByIndexes: (updatedFeatures, indexes) => {
    // set((state) => ({features: updatedFeatures}));
    for (const index of indexes) {
      const feature = updatedFeatures[index];
      if (!feature.id) {
        console.error("Feature must have an id", feature);
        continue;
      }
      yfeatures.set(String(feature.id), feature);
      // channel.push("draw", {feature: updatedFeatures[index]});
    }
  },

  addOrUpdateFeature: (feature, fromServer = false) => {
    const {features} = get();
    if (!feature.id) {
      console.error("Feature must have an id", feature);
      return;
    }
    yfeatures.set(String(feature.id), feature);
    // const index = features.findIndex((f) => f.id === feature.id);
    // if (index >= 0) {
    //   // Update the feature
    //   set((state) => ({
    //     features: state.features.map((f, i) =>i === index ? feature : f
    //     ),
    //   }));
    //   // Replace the feature in yarray
    //   yfeatures.set(String(feature.id), feature);
    // } else {
    //   // Add the new feature
    //   set((state) => ({features: [...state.features, feature]}));
    // }
    // if (!fromServer) {
    //   channel.push("draw", {feature});
    // }
  },
  clear: () => set({features: []}),
  initialize: () => {
    if (get().initialized) return;
    set({initialized: true});
    channel
      .join()
      .receive("error", (resp) => {
        console.log("Unable to join channel", resp);
      })
      .receive("ok", (resp) => {
        console.log("Joined successfully");
        console.log("resp", resp);
        if (resp.state) {
          const initialState = new Uint8Array(resp.state);
          Y.applyUpdate(ydoc, initialState); // Apply the initial state to the Yjs document
        }
        // const initialState = Uint8Array.from(atob(state), (c) =>
        //   c.charCodeAt(0)
        // );
        // Y.applyUpdate(ydoc, initialState);
        // for (const feature of features) {
        //   yfeatures.set(String(feature.id), feature);
        // }
        // set({features: Array.isArray(features) ? features : []});
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

yfeatures.observe((event) => {
  event.changes.keys.forEach((change, key) => {
    if (change.action === "add") {
      console.log(`Feature added: ${key}`, yfeatures.get(key));
    } else if (change.action === "update") {
      console.log(`Feature updated: ${key}`, yfeatures.get(key));
    } else if (change.action === "delete") {
      console.log(`Feature deleted: ${key}`);
    }
  });
  useAppStore.getState().updateFeaturesFromY();
});

ydoc.on("update", (update) => {
  // The 'update' is a Uint8Array containing only the difference
  channel.push("yjs-update", {update: Array.from(update)});
});
channel.on("yjs-update", (payload) => {
  const update = new Uint8Array(payload.update);
  Y.applyUpdate(ydoc, update); // Efficiently applies just the difference
});
