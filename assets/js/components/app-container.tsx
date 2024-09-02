import React, {useEffect} from "react";
import {MapView} from "../map/map-view";
import {useAppStore} from "../store/store";
import {ToolbarContainer} from "./toolbar-container";
import {TooltipProvider} from "./ui/tooltip";
import UndoContainer from "./undo-container";

const AppContainer: React.FC = () => {
  const initialize = useAppStore((state) => state.initialize);
  useEffect(initialize, [initialize]);

  return (
    <TooltipProvider>
      <div className="map-container absolute w-[100vw] h-[100vh] top-0 left-0">
        <MapView />
      </div>
      <div className="absolute top-2 left-2">
        <ToolbarContainer />
      </div>
      <div className="absolute bottom-2 left-2">
        <UndoContainer />
      </div>
    </TooltipProvider>
  );
};

export default AppContainer;
