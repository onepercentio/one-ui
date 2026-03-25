const rand = require("color-seed");
const win = window as any;

/**
 * Logs messages to the console with color coding for easy debugging.
 */
export default function log(filter: string, obj: any) {
  if (win.DEBUG === "*" || filter.includes(win.DEBUG))
    console.log(`%c ${filter}`, `color: ${rand.getColor(filter)}`, obj);
}