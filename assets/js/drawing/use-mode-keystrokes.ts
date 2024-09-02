import {useEffect} from "react";
import {useAppStore} from "../store/store";
import {DRAWING_MODE_KEYSTROKES, DrawingMode} from "./types";

/**
 * Add keyboard event listener for drawing modes
 **/
export function useModeKeyStrokes() {
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);
  const dropSelectedFeatures = useAppStore(
    (state) => state.dropSelectedFeatures
  );

  useEffect(() => {
    const onKeyDown = (evt) => {
      for (const [mode, keystroke] of Object.entries(DRAWING_MODE_KEYSTROKES)) {
        if (evt.key === keystroke) {
          setDrawingMode(mode as DrawingMode);
          break;
        }
      }
      if (evt.key === "Delete" || evt.key === "Backspace") {
        dropSelectedFeatures();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
