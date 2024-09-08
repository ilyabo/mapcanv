import React, {FC, useCallback} from "react";
import {LocateFixedIcon} from "lucide-react";
import {ToolbarButton} from "../components/toolbar-button";
import {INITIAL_MAP_VIEW_STATE, useAppStore} from "../store/store";

type Props = {};

const GeolocationContainer: FC<Props> = () => {
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

  return (
    <ToolbarButton
      isSelected={false}
      tooltipText={"Locate me"}
      icon={LocateFixedIcon}
      onClick={handleLocate}
    />
  );
};

export default GeolocationContainer;
