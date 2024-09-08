import {rgb} from "d3";

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

export function findLastLabelLayerId(style) {
  const layers = style.layers;
  // Find the index of the first symbol (i.e. label) layer in the map style
  if (!layers.length) {
    return undefined;
  }
  let i = layers.length - 1;
  while (i >= 0 && layers[i].type === "symbol") {
    i--;
  }
  if (i >= 0) {
    return layers[i + 1].id;
  }
  return undefined;
}

export function isValudGuid(guid: string | undefined) {
  return guid && /^[a-z0-9]{24}$/.test(guid);
}

export function generateColorFromId(id: string): string {
  const hash = hashString(id);
  const hue = hash % 360;
  return `hsl(${hue}, 100%, 50%)`;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
