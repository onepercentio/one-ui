export function randomColor(seed: string) {
  const { getColor } = require("color-seed");
  return getColor(seed);
}
