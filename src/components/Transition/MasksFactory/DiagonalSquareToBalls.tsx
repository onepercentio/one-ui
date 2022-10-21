import { renderToString } from "react-dom/server";
import React from "react";
import buildGrid, { getTime } from "./utils";

/**
 * Creates an svg that transitions from a square grid to rounded corners and them shrinks the balls to reveal the content
 * @param amountOfVerticalSquares The amount of squares vertically to be shown
 */
export default function DiagonalSquareToBalls(
  amountOfVerticalSquares: number = 10
) {
  return function (el: HTMLDivElement) {
    const height = el.clientHeight;
    const width = el.clientWidth;
    const _ballsize = height / amountOfVerticalSquares;
    const maximumBalls = width / _ballsize;
    const amountOfBalls = Math.floor(maximumBalls);

    const _time = getTime(el);
    const rndTime = () => _time * 0.25 + _time * 0.75 * 1;

    const resultSvg = renderToString(
      <svg xmlns="http://www.w3.org/2000/svg" id={Date.now().toString()}>
        {buildGrid(amountOfVerticalSquares, amountOfBalls, _ballsize).map(
          ({ ballSize: _ballsize, x: _x, y: _y, column, row }) => {
            const ratio =
              (column / amountOfBalls) * (row / amountOfVerticalSquares);
            const fourthTime = rndTime() * 0.25;
            const time = fourthTime + ratio * (fourthTime * 3);
            const padding = 1 * _ballsize;
            const ballsize = _ballsize - padding;

            const x = _x + padding / 2;
            const y = _y + padding / 2;
            return (
              <rect fill="white" rx={`${ballsize}px`}>
                <animate
                  attributeName="rx"
                  attributeType="XML"
                  values={`${0}px;${0}px;${_ballsize}px`}
                  dur={`${time / 2}ms`}
                />
                <animate
                  attributeName="x"
                  attributeType="XML"
                  values={`${_x}px;${x}px;${x + ballsize / 2}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="y"
                  attributeType="XML"
                  values={`${_y}px;${y}px;${y + ballsize / 2}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="width"
                  attributeType="XML"
                  values={`${_ballsize}px;${ballsize}px;${0}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="height"
                  attributeType="XML"
                  values={`${_ballsize}px;${ballsize}px;${0}px`}
                  dur={`${time}ms`}
                />
              </rect>
            );
          }
        )}
      </svg>
    );

    return `url('data:image/svg+xml;charset=utf8,${encodeURIComponent(
      resultSvg
    )}')`;
  };
}
