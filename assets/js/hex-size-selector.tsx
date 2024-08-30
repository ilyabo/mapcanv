import React, {FC} from "react";
import {DrawingMode, useAppStore} from "./store";
import {Slider} from "./ui/slider";
import {cn} from "./ui/utils";

const MIN_HEX_RESOLUTION = 8;
const MAX_HEX_RESOLUTION = 12;
// 0..4 -> 12..8
const sliderToResolution = (v: number) => MAX_HEX_RESOLUTION - v;

// 12..8 -> 0..4
const resolutionToSlider = (v: number) => MAX_HEX_RESOLUTION - v;

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
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="text-xs">{`H3 resolution: ${hexResolution}`}</div>
      <Slider
        value={[resolutionToSlider(hexResolution)]}
        min={0}
        max={4}
        step={1}
        onValueChange={(v) => setHexResolution(sliderToResolution(v[0]))}
      />
    </div>
  );
};
