import {FC} from "react";
export type ColorSelectorProps = {};
import {ColorPicker} from "./ui/color-picker";
import React from "react";
import {useAppStore} from "../store/store";

export const ColorSelector: FC<ColorSelectorProps> = (props) => {
  const {} = props;
  const color = useAppStore((state) => state.color);
  const setColor = useAppStore((state) => state.setColor);

  return <ColorPicker onChange={(v) => setColor(v)} value={color} />;
};
