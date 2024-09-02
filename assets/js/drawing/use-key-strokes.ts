import {useEffect} from "react";
import {useAppStore} from "../store/store";
import {DRAWING_MODE_KEYSTROKES, DrawingMode} from "./types";

/**
 * Add keyboard event listener for drawing modes
 **/
export function useKeyStrokes() {
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);
  const undo = useAppStore((state) => state.undo);
  const redo = useAppStore((state) => state.redo);
  const dropSelectedFeatures = useAppStore(
    (state) => state.dropSelectedFeatures
  );

  useEffect(() => {
    const onKeyDown = (event) => {
      for (const [mode, keystroke] of Object.entries(DRAWING_MODE_KEYSTROKES)) {
        if (event.key === keystroke) {
          setDrawingMode(mode as DrawingMode);
          break;
        }
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        dropSelectedFeatures();
      }
      // Undo
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        undo();
      }

      // 'Redo' command
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        event.shiftKey
      ) {
        event.preventDefault();
        // Handle the redo action here
        redo();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
