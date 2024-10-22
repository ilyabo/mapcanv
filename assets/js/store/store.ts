import {interpolateRainbow, rgb} from 'd3';
import {produce} from 'immer';
import {LngLat, ViewState} from 'react-map-gl';
import {create} from 'zustand';
import {useContext} from 'react';
import {StoreContext} from './AppStoreProvider';
import {createId} from '@paralleldrive/cuid2';
import {Socket} from 'phoenix';
import {IndexeddbPersistence} from 'y-indexeddb';
import * as Y from 'yjs';
import {DrawingMode} from '../map/types';
import {
  PhoenixChannel,
  PhoenixSocket,
  PolygonFeature,
  PresenseState,
  UserPresence,
} from './types';
import {generateColorFromId, parseUserPresenceEntry} from './utils';

export type DrawingState = {
  userId: string;
  userColor: string;
  userName: string | null;
  ydoc: Y.Doc;
  yfeaturesUndo: Y.UndoManager;
  indexedDbProvider: IndexeddbPersistence;

  isShared: boolean;
  presence: UserPresence[] | undefined;
  channel: PhoenixChannel | undefined;
  socket: PhoenixSocket | undefined;

  shouldFitViewport: boolean | undefined; // whether to fit the viewport to the features
  features: PolygonFeature[];
  mapViewState: ViewState;
  isPanning: boolean;
  color: string;
  selectedIds: string[] | undefined;
  initProject: (guid?: string) => void;
  setColor: (color: string) => void;
  setSelectedIds: (ids: string[] | undefined) => void;
  setMapViewState: (viewState: ViewState) => void;
  shareProject: () => string;
  undo: () => void;
  redo: () => void;
  setPanning: (isPanning: boolean) => void;
  addOrUpdateFeatures: (feature: PolygonFeature[]) => void;
  clear: () => void;
  mode: DrawingMode;
  setDrawingMode: (mode: DrawingMode) => void;
  dropSelectedFeatures: () => void;
  hexResolution: number;
  setHexResolution: (resolution: number) => void;
  pushCursorPresence: (latLng: LngLat) => void;
};

const LOCAL_DOCUMENT_GUID = '__local__';

export const INITIAL_MAP_VIEW_STATE: ViewState = {
  latitude: 0,
  longitude: 0,
  zoom: 2,
  bearing: 0,
  pitch: 0,
  padding: {top: 20, bottom: 20, left: 20, right: 20},
} as const;

export const createStore = () =>
  create<DrawingState>((set, get) => {
    function initYDoc(guid = LOCAL_DOCUMENT_GUID) {
      const ydoc = new Y.Doc({guid});
      const yfeatures = getYFeatures(ydoc);
      const yfeaturesUndo = new Y.UndoManager([yfeatures]);
      const indexedDbProvider = new IndexeddbPersistence(guid, ydoc);
      yfeatures.observe(syncFeatures);
      indexedDbProvider.on('synced', syncFeatures);
      return {ydoc, yfeaturesUndo, indexedDbProvider};
    }

    const syncFeatures = () => {
      // Extract features from ydoc and store them in the state for rendering
      const features = Array.from(getYFeatures(get().ydoc).values());
      set({
        features,
        // If it's the first sync, fit the viewport to the features only if there are any
        ...(get().shouldFitViewport === undefined && {
          shouldFitViewport: features.length > 0,
        }),
      });
    };

    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = createId();
      localStorage.setItem('user_id', userId);
    }

    return {
      userId,
      userColor: generateColorFromId(userId),
      userName: null,
      presence: undefined,
      channel: undefined,
      ...initYDoc(),
      mapViewState: INITIAL_MAP_VIEW_STATE,
      features: [],
      color: rgb(interpolateRainbow(Math.random())).formatHex(),
      loadedEmpty: false,
      isShared: false,
      selectedIds: undefined,
      mode: DrawingMode.SELECT,
      selectedIndexes: undefined,
      hexResolution: 10,
      isPanning: false,
      socket: undefined,
      shouldFitViewport: undefined,

      initProject: (guid) => {
        const oldGuid = get().ydoc.guid;
        if (guid && guid !== oldGuid) {
          // Clear the current document and create a new one
          const {ydoc, indexedDbProvider} = get();
          getYFeatures(ydoc).unobserve(syncFeatures);
          indexedDbProvider.destroy();
          ydoc.destroy();
          set({...initYDoc(guid)});
          // TODO: disconnect from the current socket if it exists
        }

        if (guid) {
          const {ydoc, yfeaturesUndo, isShared, userId, userName, userColor} =
            get();
          if (isShared) return;

          const socket = new Socket('/socket', {params: {userId}});
          // @ts-ignore
          socket.connect();

          const channel = socket.channel(
            `drawing:${guid}`,
            // Y.encodeStateAsUpdate(ydoc).buffer // Send the initial state to the server
            {userName, userColor}
          );
          channel
            .join()
            .receive('error', (resp) => {
              console.log('Unable to join channel', resp);
            })
            .receive('ok', (resp) => {
              console.log('Joined successfully');
              if (resp) {
                const initialState = new Uint8Array(resp);
                Y.applyUpdate(ydoc, initialState, 'initial-sync'); // Use custom origin to exclude from undo/redo
              } else {
                console.log('No initial state');
              }
            })
            .receive('error', ({reason}) => {
              console.error('failed to join', reason);
            });

          ydoc.on('update', (update: Uint8Array, origin: string) => {
            if (origin !== 'remote') {
              // Avoid feedback loop by checking if the update is coming from "remote"
              channel.push('yjs-update', update.buffer);
            }
          });

          channel.on('yjs-update', (payload: ArrayBuffer) => {
            const update = new Uint8Array(payload);
            // Apply the update to the Yjs document
            Y.applyUpdate(ydoc, update, 'remote'); // Mark the update as coming from "remote"
          });

          channel.on('presence_state', (presenceState: PresenseState) => {
            set({
              presence: Object.entries(presenceState).map(
                parseUserPresenceEntry
              ),
            });
          });
          channel.on('presence_diff', ({leaves, joins}) => {
            set((state) =>
              produce(state, (draft) => {
                if (!draft.presence) draft.presence = [];
                draft.presence = draft.presence.filter(
                  ({userId}) => !(userId in leaves)
                );
                draft.presence.push(
                  ...Object.entries(joins).map(parseUserPresenceEntry)
                );
                draft.presence.sort((a, b) => a.userId.localeCompare(b.userId));
              })
            );
          });

          set({socket, channel, isShared: true, presence: []});
        }
      },

      pushCursorPresence: ({lat, lng}) => {
        const {userId, isShared, channel, userName, userColor, presence} =
          get();
        if (isShared && channel && presence) {
          if (presence.length > 1) {
            // Only push the cursor position if there are other users in the room
            channel.push('cursor_moved', {lat, lng, userName, userColor});
          }
        }
      },

      shareProject: () => {
        const guid = createId();
        const oldState = Y.encodeStateAsUpdate(get().ydoc);
        get().initProject(guid);
        // Make a copy of the current document with the new guid
        const newDoc = get().ydoc;
        Y.applyUpdate(newDoc, oldState);
        return guid;
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

      undo: () => get().yfeaturesUndo?.undo(),
      redo: () => get().yfeaturesUndo?.redo(),
      clear: () => getYFeatures(get().ydoc).clear(),

      setMapViewState: (viewState) => set({mapViewState: viewState}),
      setHexResolution: (resolution) => set({hexResolution: resolution}),
      setDrawingMode: (mode) => {
        set({mode});
        if (
          [
            DrawingMode.DRAW_LINE,
            DrawingMode.DRAW_POLYGON_FREEHAND,
            DrawingMode.DRAW_POLYGON,
          ].includes(DrawingMode[mode])
        ) {
          set({selectedIds: undefined});
        }
      },
      setPanning: (isPanning) => set({isPanning}),
      setSelectedIds: (ids) => set({selectedIds: ids}),

      addOrUpdateFeatures: (features) => {
        for (const feature of features) {
          if (!feature.id) {
            console.error('Feature must have an id', feature);
            continue;
          }
          // Update the yarray with the new feature
          getYFeatures(get().ydoc).set(String(feature.id), feature);
        }
      },

      dropSelectedFeatures: () => {
        const {selectedIds, setSelectedIds: setSelection} = get();
        if (selectedIds) {
          for (const id of selectedIds) {
            getYFeatures(get().ydoc).delete(id);
          }
        }
        set({selectedIds: undefined, mode: DrawingMode.SELECT});
      },
    };

    function getYFeatures(doc: Y.Doc) {
      return doc.getMap<PolygonFeature>('features');
    }

    function applyToSelectedFeatures(
      fn: (feature: PolygonFeature) => PolygonFeature
    ): void {
      const {ydoc, selectedIds, addOrUpdateFeatures} = get();
      if (selectedIds) {
        const toUpdate: PolygonFeature[] = [];
        for (const id of selectedIds) {
          const feature = getYFeatures(ydoc).get(id);
          if (!feature) {
            console.error('Feature not found', id);
            continue;
          }
          toUpdate.push(fn(feature));
        }
        console.log('Updating features', toUpdate);
        addOrUpdateFeatures(toUpdate);
      }
    }
  });

// ... existing code ...

export const useAppStore = <T>(selector: (state: DrawingState) => T): T => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Missing AppStoreProvider in the tree');
  return store(selector);
};

// ... rest of the file
