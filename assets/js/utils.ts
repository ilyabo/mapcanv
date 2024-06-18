import {rgb} from 'd3';

export const colorToRGBA = (
  color,
  opts?: {alpha?: number; darker?: number}
): [number, number, number, number] => {
  const {alpha = 255, darker = 0} = opts ?? {};
  let c = rgb(color);
  if (darker) {
    c = c.darker(darker);
  }
  return [c.r, c.g, c.b, alpha];
};
