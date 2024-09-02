import React, {FC} from "react";
import {
  DrawingMode,
  getDrawingModeIcon,
  getDrawingModeKeystroke,
  getDrawingModeLabel,
} from "../drawing/types";
import {useAppStore} from "../store/store";
import {ColorSelector} from "./color-selector";
import {ToolbarButton} from "./toolbar-button";

export type ModeSelectorProps = {};

export const ToolbarContainer: FC<ModeSelectorProps> = (props) => {
  const drawingMode = useAppStore((state) => state.mode);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);

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
      </div>
      <ColorSelector />
    </div>

    // <DropdownMenu>
    //   <DropdownMenuTrigger asChild>
    //     <div className="flex flex-row gap-2 items-center">
    //       <Button variant="default">
    //         <HamburgerMenuIcon />
    //       </Button>
    //       <div className="font-sm">{drawingMode}</div>
    //     </div>
    //   </DropdownMenuTrigger>
    //   <DropdownMenuContent className="w-56" align="start">
    //     <DropdownMenuLabel>Drawing Mode</DropdownMenuLabel>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuGroup>
    //       {Object.keys(DrawingMode).map((mode) => (
    //         <DropdownMenuItem
    //           key={mode}
    //           onClick={() => setDrawingMode(DrawingMode[mode])}
    //         >
    //           {DrawingMode[mode]}
    //           <DropdownMenuShortcut>
    //             {KEYSTROKES_BY_MODE[DrawingMode[mode]]}
    //           </DropdownMenuShortcut>
    //         </DropdownMenuItem>
    //       ))}
    //     </DropdownMenuGroup>
    //     <DropdownMenuSeparator />
    //     <DropdownMenuItem disabled>
    //       Pan the map
    //       <DropdownMenuShortcut>Space + Drag</DropdownMenuShortcut>
    //     </DropdownMenuItem>
    //   </DropdownMenuContent>
    // </DropdownMenu>
  );
};
