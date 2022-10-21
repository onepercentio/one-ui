export default function buildGrid(
  amountOfVerticalSquares: number,
  howManyHorizontalSquare: number,
  ballSize: number
) {
  return new Array(howManyHorizontalSquare * amountOfVerticalSquares)
    .fill(undefined)
    .map((_, i) => {
      const modX = Math.floor(i / howManyHorizontalSquare);
      const modY = i - modX * howManyHorizontalSquare;
      const ballsize = ballSize * 1.1;
      const padding = (ballsize - ballSize) / 2;
      const x = modY * ballSize - padding;
      const y = modX * ballSize - padding;

      return {
        x,
        y,
        ballSize,
        column: modY,
        row: modX,
      };
    });
}

export function getTime(el: HTMLDivElement) {
  const _time =
    getComputedStyle(el.firstElementChild!).getPropertyValue(
      "--animation-speed-transition"
    ) || "250ms";
  const __time = _time.endsWith("ms")
    ? Number(_time.replace("ms", ""))
    : Number(_time.replace("s", "")) * 1000;
  return __time + 50;
}
