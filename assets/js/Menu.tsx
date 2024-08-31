import React, {FC} from "react";
import {useAppStore} from "./store";
import {Button} from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {HamburgerMenuIcon} from "@radix-ui/react-icons";
import {DrawingMode, KEYSTROKES_BY_MODE} from "./drawing/types";
export type ModeSelectorProps = {};

export const Menu: FC<ModeSelectorProps> = (props) => {
  const drawingMode = useAppStore((state) => state.mode);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex flex-row gap-2 items-center">
          <Button variant="default">
            <HamburgerMenuIcon />
          </Button>
          <div className="font-sm">{drawingMode}</div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>Drawing Mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {Object.keys(DrawingMode).map((mode) => (
            <DropdownMenuItem
              key={mode}
              onClick={() => setDrawingMode(DrawingMode[mode])}
            >
              {DrawingMode[mode]}
              <DropdownMenuShortcut>
                {KEYSTROKES_BY_MODE[DrawingMode[mode]]}
              </DropdownMenuShortcut>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          Pan the map
          <DropdownMenuShortcut>Space + Drag</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
