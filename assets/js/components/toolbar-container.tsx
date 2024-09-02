import React, {FC} from "react";
import {
  DrawingMode,
  getDrawingModeIcon,
  getDrawingModeKeystroke,
  getDrawingModeLabel,
} from "../drawing/types";
import {useAppStore} from "../store/store";
import {Button} from "./ui/button";
import {LucideIcon} from "lucide-react";
import {cn} from "./ui/utils";
import {Tooltip, TooltipContent, TooltipTrigger} from "./ui/tooltip";
import {ColorSelector} from "./color-selector";

export type ModeSelectorProps = {};

const ToolbarButton: FC<{
  icon: LucideIcon;
  isSelected?: boolean;
  tooltipText: string;
  onClick: () => void;
}> = ({icon: Icon, isSelected, tooltipText, onClick}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className={cn(
            "border bg-gray-400 hover:bg-gray-600 transition-colors",
            {
              "bg-gray-700": isSelected,
              shadow: isSelected,
            }
          )}
          size="icon"
          onClick={onClick}
        >
          {Icon ? <Icon size="16px" /> : null}
        </Button>
      </TooltipTrigger>
      <TooltipContent align="center" side="right" className="text-xs">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
};

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
