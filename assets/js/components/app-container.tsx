import React, {useEffect} from "react";
import {MapView} from "../map/map-view";
import {ColorSelector} from "./color-selector";
import {HexSizeSelector} from "./hex-size-selector";
import {useAppStore} from "../store/store";
import {ToolbarContainer} from "./toolbar-container";

const AppContainer: React.FC = () => {
  const initialize = useAppStore((state) => state.initialize);
  useEffect(initialize, [initialize]);

  return (
    <>
      <div className="map-container absolute w-[100vw] h-[100vh] top-0 left-0">
        <MapView />
      </div>
      <div className="absolute top-4 left-4 flex flex-col gap-1">
        <ToolbarContainer />
        <ColorSelector />
      </div>
      {/* <div className="absolute top-0 right-0 p-4 flex flex-row gap-2 items-center">
        <HexSizeSelector className="w-[110px]" />       
      </div> */}
    </>
  );
};

export default AppContainer;
