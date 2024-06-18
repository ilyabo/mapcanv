import React, {FC} from 'react';
import {DrawingMode, useAppStore} from './store';
import {Slider} from './ui/slider';
import {cn} from './ui/utils';

export type HexSizeSelectorProps = {className?: string};
export const HexSizeSelector: FC<HexSizeSelectorProps> = (props) => {
  const hexResolution = useAppStore((state) => state.hexResolution);
  const setHexResolution = useAppStore((state) => state.setHexResolution);
  const {className} = props;
  const drawingMode = useAppStore((state) => state.mode);
  if (drawingMode !== DrawingMode.DRAW_HEXAGON) {
    return null;
  }
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="text-xs">{`Hex resolution: ${hexResolution}`}</div>
      <Slider
        value={[hexResolution]}
        min={8}
        max={12}
        step={1}
        onValueChange={(v) => setHexResolution(v[0])}
      />
    </div>
  );
};
