import React, {useEffect} from "react";
import {MapView} from "../map/map-view";
import {ColorSelector} from "./color-selector";
import {useAppStore} from "../store/store";
import {ToolbarContainer} from "./toolbar-container";
import {TooltipProvider} from "./ui/tooltip";

const AppContainer: React.FC = () => {
  const initialize = useAppStore((state) => state.initialize);
  useEffect(initialize, [initialize]);

  return (
    <TooltipProvider>
      <div className="map-container absolute w-[100vw] h-[100vh] top-0 left-0">
        <MapView />
      </div>
      <div className="absolute top-4 left-4">
        <ToolbarContainer />
      </div>
      {/* <div className="absolute top-0 right-0 p-4 flex flex-row gap-2 items-center">
        <HexSizeSelector className="w-[110px]" />       
      </div> */}
    </TooltipProvider>
  );
};

export default AppContainer;
