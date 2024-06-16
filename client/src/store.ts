// src/store.ts
import create from 'zustand';
import channel from './socket';

interface Line {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface DrawingState {
  lines: Line[];
  initialized: boolean;
  setLines: (lines: Line[]) => void;
  addLine: (line: Line, fromServer?: boolean) => void;
  clear: () => void;
  initialize: () => void;
}

export const useDrawingStore = create<DrawingState>((set, get) => ({
  lines: [],
  initialized: false,
  setLines: (lines) => set({lines: Array.isArray(lines) ? lines : []}),
  addLine: (line, fromServer = false) => {
    set((state) => ({lines: [...state.lines, line]}));
    if (!fromServer) {
      channel.push('draw', {line});
    }
  },
  clear: () => set({lines: []}),
  initialize: () => {
    if (get().initialized) return;
    set({initialized: true});

    channel
      .join()
      .receive('ok', ({lines}) => {
        set({lines: Array.isArray(lines) ? lines : []});
      })
      .receive('error', ({reason}) => {
        console.error('failed to join', reason);
      });

    channel.on('draw', ({line}: {line: Line}) => {
      set((state) => ({lines: [...state.lines, line]}));
    });
  },
}));
