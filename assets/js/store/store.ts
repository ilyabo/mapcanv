// src/store.ts
import {FeatureOf, Polygon} from "@deck.gl-community/editable-layers";
import {interpolateRainbow, rgb} from "d3";
import {create} from "zustand";

import {DrawingMode} from "../drawing/types";
import * as Y from "yjs";
import {Socket} from "phoenix";

export type PolygonFeature = FeatureOf<Polygon>;

interface DrawingState {
  features: PolygonFeature[];
  isPanning: boolean;
  color: string;
  selectedIds: string[] | undefined;
  setColor: (color: string) => void;
  setSelectedIds: (ids: string[] | undefined) => void;
  undo: () => void;
  redo: () => void;
  initialized: boolean;
  setPanning: (isPanning: boolean) => void;
  addOrUpdateFeatures: (feature: PolygonFeature[]) => void;
  clear: () => void;
  initialize: () => void;
  mode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  dropSelectedFeatures: () => void;
  hexResolution: number;
  setHexResolution: (resolution: number) => void;
}

export const useAppStore = create<DrawingState>((set, get) => {
  const ydoc = new Y.Doc();
  const yfeatures = ydoc.getMap<PolygonFeature>("features");

  // We'll only start capturing undo/redo after the initial state is applied when joining the channel
  let yfeaturesUndo: Y.UndoManager | undefined = undefined;

  const socket = new Socket("/socket" /*{params: {token: window.userToken}}*/);
  // @ts-ignore
  socket.connect();

  const channel = socket.channel("drawing:lobby", {});

  return {
    // Array of features extracted from yarray used for rendering
    features: [], // Don't modify this directly, use yfeatures instead
    color: rgb(interpolateRainbow(Math.random())).formatHex(),
    initialized: false,
    selectedIds: undefined,
    mode: DrawingMode.SELECT,
    selectedIndexes: undefined,
    hexResolution: 10,
    isPanning: false,

    initialize: () => {
      if (get().initialized) return;

      channel
        .join()
        .receive("error", (resp) => {
          console.log("Unable to join channel", resp);
        })
        .receive("ok", (resp) => {
          console.log("Joined successfully");
          if (resp) {
            const initialState = new Uint8Array(resp);
            Y.applyUpdate(ydoc, initialState); // Apply the initial state to the Yjs document
            yfeaturesUndo = new Y.UndoManager(yfeatures);
          } else {
            console.log("No initial state");
          }
        })
        .receive("error", ({reason}) => {
          console.error("failed to join", reason);
        });

      yfeatures.observe((event) => {
        // Update the local features array by extracting the values from the yarray
        return set({features: Array.from(yfeatures.values())});

        // event.changes.keys.forEach((change, key) => {
        //   if (change.action === "add") {
        //     console.log(`Feature added: ${key}`, yfeatures.get(key));
        //   } else if (change.action === "update") {
        //     console.log(`Feature updated: ${key}`, yfeatures.get(key));
        //   } else if (change.action === "delete") {
        //     console.log(`Feature deleted: ${key}`);
        //   }
        // });
      });

      ydoc.on("update", (update: Uint8Array, origin: string) => {
        if (origin !== "remote") {
          // Avoid feedback loop by checking if the update is coming from "remote"
          channel.push("yjs-update", update.buffer);
        }
      });

      channel.on("yjs-update", (payload: ArrayBuffer) => {
        const update = new Uint8Array(payload);
        // Apply the update to the Yjs document
        Y.applyUpdate(ydoc, update, "remote"); // Mark the update as coming from "remote"
      });

      set({initialized: true});
    },

    setColor: (color) => {
      set({color});
      const {selectedIds} = get();
      if (selectedIds) {
        applyToSelectedFeatures((feature) => ({
          ...feature,
          properties: {...feature.properties, color},
        }));
      }
    },

    undo: () => yfeaturesUndo?.undo(),
    redo: () => yfeaturesUndo?.redo(),

    setHexResolution: (resolution) => set({hexResolution: resolution}),
    setDrawingMode: (mode) => set({mode}),
    setPanning: (isPanning) => set({isPanning}),
    setSelectedIds: (ids) => set({selectedIds: ids}),
    clear: () => yfeatures.clear(),

    addOrUpdateFeatures: (features) => {
      for (const feature of features) {
        if (!feature.id) {
          console.error("Feature must have an id", feature);
          continue;
        }
        // Update the yarray with the new feature
        yfeatures.set(String(feature.id), feature);
      }
    },

    dropSelectedFeatures: () => {
      const {selectedIds, setSelectedIds: setSelection} = get();
      if (selectedIds) {
        for (const id of selectedIds) {
          yfeatures.delete(id);
        }
      }
      set({selectedIds: undefined, mode: DrawingMode.SELECT});
    },
  };

  function applyToSelectedFeatures(
    fn: (feature: PolygonFeature) => PolygonFeature
  ): void {
    const {selectedIds, addOrUpdateFeatures} = get();
    if (selectedIds) {
      const toUpdate: PolygonFeature[] = [];
      for (const id of selectedIds) {
        const feature = yfeatures.get(id);
        if (!feature) {
          console.error("Feature not found", id);
          continue;
        }
        toUpdate.push(fn(feature));
      }
      console.log("Updating features", toUpdate);
      addOrUpdateFeatures(toUpdate);
    }
  }
});
