import {rgb} from 'd3';

export const colorToRGBA = (
  color,
  alpha = 200
): [number, number, number, number] => {
  const c = rgb(color);
  return [c.r, c.g, c.b, alpha];
};
