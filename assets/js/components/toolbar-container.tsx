import React, {FC} from "react";
import {
  DRAWING_MODE_ICONS,
  DrawingMode,
  getDrawingModeIcon,
} from "../drawing/types";
import {useAppStore} from "../store/store";
import {Button} from "./ui/button";
import {LucideIcon} from "lucide-react";
import {cn} from "./ui/utils";

export type ModeSelectorProps = {};

const ToolbarButton: FC<{
  icon: LucideIcon;
  isSelected?: boolean;
  onClick: () => void;
}> = ({icon: Icon, isSelected, onClick}) => {
  return (
    <Button
      className={cn("border bg-gray-400 hover:bg-gray-600 transition-colors", {
        "bg-gray-700": isSelected,
        shadow: isSelected,
      })}
      size="icon"
      onClick={onClick}
    >
      {Icon ? <Icon size="16px" /> : null}
    </Button>
  );
};

export const ToolbarContainer: FC<ModeSelectorProps> = (props) => {
  const drawingMode = useAppStore((state) => state.mode);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);

  return (
    <div className="flex flex-col gap-1">
      {Object.keys(DrawingMode).map((mode) => {
        return (
          <ToolbarButton
            key={mode}
            icon={getDrawingModeIcon(DrawingMode[mode])}
            isSelected={DrawingMode[mode] === drawingMode}
            onClick={() => setDrawingMode(DrawingMode[mode])}
          />
        );
      })}
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
