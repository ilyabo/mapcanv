import React, {FC} from 'react';
import {DrawingMode, useAppStore} from './store';
import {Button} from './ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import {HamburgerMenuIcon} from '@radix-ui/react-icons';
export type ModeSelectorProps = {};

const KEYSTROKES_BY_MODE = {
  [DrawingMode.DRAW_POLYGON]: 'p',
  [DrawingMode.DRAW_HEXAGON]: 'h',
};

export const ModeSelector: FC<ModeSelectorProps> = (props) => {
  const drawingMode = useAppStore((state) => state.mode);
  const setDrawingMode = useAppStore((state) => state.setDrawingMode);

  // add keyboard shortcuts for changing drawing mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      for (const mode in KEYSTROKES_BY_MODE) {
        if (e.key === KEYSTROKES_BY_MODE[mode]) {
          setDrawingMode(mode as DrawingMode);
          break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setDrawingMode]);

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

        <DropdownMenuItem disabled>
          Pan the map
          <DropdownMenuShortcut>Hold Space</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
