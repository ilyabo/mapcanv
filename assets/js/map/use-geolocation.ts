import {useCallback, useState} from "react";
import {INITIAL_MAP_VIEW_STATE, useAppStore} from "../store/store";

export function useGeolocation() {
  const setMapViewState = useAppStore((state) => state.setMapViewState);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<GeolocationPosition | null>(null);

  const updateViewport = useCallback(
    (pos: GeolocationPosition) => {
      if (!pos) return;
      const {latitude, longitude} = pos.coords;
      setMapViewState({
        ...INITIAL_MAP_VIEW_STATE,
        latitude,
        longitude,
        zoom: 10,
      });
      setPosition(pos);
    },
    [setMapViewState]
  );

  const handleLocate = useCallback(() => {
    if (position) {
      updateViewport(position);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateViewport(pos);
        },
        (error) => {
          console.error("error", error);
          setError(error.message);
        }
      );
    }
  }, [position, setMapViewState]);

  return {
    handleLocate,
    locateError: error,
    position,
  };
}
