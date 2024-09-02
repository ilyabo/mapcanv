import {useState, useEffect} from "react";
import {MapRef} from "react-map-gl/dist/esm/exports-maplibre";
import {useAppStore} from "../store/store";
import {KEYSTROKES_BY_MODE, DrawingMode} from "./types";

/**
 * Add keyboard event listener for drawing modes
 **/
export function useModeKeyStrokes() {
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);

  useEffect(() => {
    const onKeyDown = (evt) => {
      for (const mode in KEYSTROKES_BY_MODE) {
        if (evt.key === KEYSTROKES_BY_MODE[mode]) {
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
