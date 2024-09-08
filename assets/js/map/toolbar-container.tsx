import React, {FC} from "react";

import {useAppStore} from "../store/store";
import {ColorSelector} from "../components/color-selector";
import {ToolbarButton} from "../components/toolbar-button";
import {
  DrawingMode,
  getDrawingModeLabel,
  getDrawingModeKeystroke,
  getDrawingModeIcon,
} from "./types";
import {Trash2Icon} from "lucide-react";

export type ModeSelectorProps = {};

export const ToolbarContainer: FC<ModeSelectorProps> = (props) => {
  const drawingMode = useAppStore((state) => state.mode);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);
  const clear = useAppStore((state) => state.clear);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {Object.keys(DrawingMode).map((mode) => {
          const label = getDrawingModeLabel(DrawingMode[mode]);
          const keystroke = getDrawingModeKeystroke(DrawingMode[mode]);
          return (
            <ToolbarButton
              key={mode}
              icon={getDrawingModeIcon(DrawingMode[mode])}
              isSelected={DrawingMode[mode] === drawingMode}
              tooltipText={`${label} ("${keystroke}" on keyboard)`}
              onClick={() => setDrawingMode(DrawingMode[mode])}
            />
          );
        })}
        <ToolbarButton
          icon={Trash2Icon}
          tooltipText="Clear map"
          onClick={() => {
            if (confirm("Are you sure you want to clear the map?")) {
              clear();
            }
          }}
        />
      </div>
      <ColorSelector />
    </div>
  );
};
