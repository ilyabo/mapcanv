import {LocateFixedIcon, SquareDotIcon} from "lucide-react";
import React, {FC} from "react";
import {MapRef} from "react-map-gl/maplibre";
import {ToolbarButton} from "../components/toolbar-button";
import ShareContainer from "./share-container";
import {ToolbarContainer} from "./toolbar-container";
import {UndoContainer} from "./undo-container";
import {useFitBounds} from "./use-fit-bounds";
import {useGeolocation} from "./use-geolocation";
import PresenceContainer from "./presence-container";

type Props = {
  mapRef: React.RefObject<MapRef>;
};

const MapControlsContainer: FC<Props> = (props) => {
  const {mapRef} = props;
  const {handleLocate} = useGeolocation();
  const {handleFitBounds} = useFitBounds(mapRef);

  return (
    <>
      <div className="absolute top-2 left-2">
        <ToolbarContainer />
      </div>
      <div className="absolute bottom-2 left-2">
        <UndoContainer />
      </div>
      <div className="absolute flex flex-col gap-1 top-2 right-2 items-end">
        <div className="flex gap-1 items-center">
          <PresenceContainer />
          <ShareContainer />
        </div>
        <ToolbarButton
          isSelected={false}
          tooltipText={"Locate me"}
          icon={LocateFixedIcon}
          onClick={handleLocate}
        />
        <ToolbarButton
          isSelected={false}
          tooltipText={"Fit bounds"}
          icon={SquareDotIcon}
          onClick={handleFitBounds}
        />
      </div>
    </>
  );
};

export default MapControlsContainer;
