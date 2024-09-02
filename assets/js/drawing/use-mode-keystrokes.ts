import {useState, useEffect} from "react";
import {MapRef} from "react-map-gl/dist/esm/exports-maplibre";
import {useAppStore} from "../store/store";
import {DRAWING_MODE_KEYSTROKES, DrawingMode} from "./types";

/**
 * Add keyboard event listener for drawing modes
 **/
export function useModeKeyStrokes() {
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);

  useEffect(() => {
    const onKeyDown = (evt) => {
      for (const [keystroke, mode] of Object.entries(DRAWING_MODE_KEYSTROKES)) {
        if (evt.key === keystroke) {
          setDrawingMode(mode as DrawingMode);
          break;
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
