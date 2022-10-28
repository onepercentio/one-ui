const rand = require("color-seed");

export default function log(filter: string, obj: any) {
  console.log(`%c ${filter}`, `color: ${rand.getColor(filter)}`, obj);
}
