import React, {useEffect} from "react";
import {TooltipProvider} from "./components/ui/tooltip";
import {MapContainer} from "./map/map-container";
import {useAppStore} from "./store/store";
import {isValudGuid} from "./store/utils";

const AppContainer: React.FC = () => {
  const init = useAppStore((state) => state.initProject);
  useEffect(() => {
    const guid = location.pathname.split("/").pop();
    init(isValudGuid(guid) ? guid : undefined);
  }, [init]);

  return (
    <TooltipProvider>
      <MapContainer />
    </TooltipProvider>
  );
};

export default AppContainer;
