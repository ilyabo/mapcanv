import {useCallback} from "react";
import {INITIAL_MAP_VIEW_STATE, useAppStore} from "../store/store";

export function useGeolocation() {
  const setMapViewState = useAppStore((state) => state.setMapViewState);

  const handleLocate = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const {latitude, longitude} = position.coords;
        setMapViewState({
          ...INITIAL_MAP_VIEW_STATE,
          latitude,
          longitude,
          zoom: 10,
        });
      },
      (error) => {
        console.error("error", error);
      }
    );
  }, [setMapViewState]);

  return {
    handleLocate,
  };
}
