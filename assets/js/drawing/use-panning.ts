import {useState, useEffect} from "react";
import {MapRef} from "react-map-gl/dist/esm/exports-maplibre";
import {useAppStore} from "../store";
import {KEYSTROKES_BY_MODE, DrawingMode} from "./types";

/**
 * Add space keyboard event listener
 **/
export function usePanning(mapRef: React.RefObject<MapRef>) {
  const isPanning = useAppStore((state) => state.isPanning);
  const setPanning = useAppStore((state) => state.setPanning);

  useEffect(() => {
    const onKeyDown = (evt) => {
      if (evt.key === " ") {
        mapRef.current?.getMap().dragPan.enable();
        setPanning(true);
      }
    };
    const onKeyUp = (evt) => {
      if (evt.key === " ") {
        mapRef.current?.getMap().dragPan.disable();
        setPanning(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);
  return {isPanning};
}
