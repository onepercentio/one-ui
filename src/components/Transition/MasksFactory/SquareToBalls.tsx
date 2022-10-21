import { renderToString } from "react-dom/server";
import React from "react";
import buildGrid, { getTime } from "./utils";

/**
 * Creates an svg that transitions from a square grid to rounded corners and them shrinks the balls to reveal the content
 * @param amountOfVerticalSquares The amount of squares vertically to be shown
 */
export default function (amountOfVerticalSquares: number = 10) {
  return function (el: HTMLDivElement) {
    const height = el.clientHeight;
    const width = el.clientWidth;
    const _ballsize = height / amountOfVerticalSquares;
    const maximumBalls = width / _ballsize;
    const amountOfBalls = Math.floor(maximumBalls);

    const time = getTime(el);

    const resultSvg = renderToString(
      <svg xmlns="http://www.w3.org/2000/svg" id={Date.now().toString()}>
        {buildGrid(amountOfVerticalSquares, amountOfBalls, _ballsize).map(
          ({ ballSize, x, y }) => {
            return (
              <rect fill="white">
                <animate
                  attributeName="rx"
                  attributeType="XML"
                  values={`${0}px;${ballSize / 2}px;${ballSize / 2}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="x"
                  attributeType="XML"
                  values={`${x}px;${x}px;${x + ballSize / 2}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="y"
                  attributeType="XML"
                  values={`${y}px;${y}px;${y + ballSize / 2}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="width"
                  attributeType="XML"
                  values={`${ballSize}px;${ballSize}px;${0}px`}
                  dur={`${time}ms`}
                />
                <animate
                  attributeName="height"
                  attributeType="XML"
                  values={`${ballSize}px;${ballSize}px;${0}px`}
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
