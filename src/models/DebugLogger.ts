const rand = require("color-seed");
const win = window as any;

export default function log(filter: string, obj: any) {
  if (win.DEBUG === "*" || filter.includes(win.DEBUG))
    console.log(`%c ${filter}`, `color: ${rand.getColor(filter)}`, obj);
}
