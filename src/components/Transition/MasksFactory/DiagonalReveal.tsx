import { renderToString } from "react-dom/server";
import React from "react";
import { getTime } from "./utils";

export default function DiagonalReveal(el: HTMLDivElement) {
  const height = el.clientHeight;
  const width = el.clientWidth;
  const time = getTime(el);
  const filterId = `f-${Date.now().toString()}`;
  const resultSvg = renderToString(
    <svg xmlns="http://www.w3.org/2000/svg" id={Date.now().toString()}>
      <defs>
        <filter id={filterId} x="0" y="0">
          <feGaussianBlur in="SourceGraphic" stdDeviation="15" />
        </filter>
      </defs>
      <rect
        x="-25"
        y="-25"
        width={`${width * 1.5}px`}
        fill="white"
        height={`${height * 1.1}px`}
        filter={`url(#${filterId})`}
      >
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          values="0 0 0; 25 0 0; 32 0 0;"
          dur={`${time}ms`}
        />
        <animateTransform
          additive="sum"
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values={`0 0; 0 ${height * 0.2}; 0 ${height};`}
          dur={`${time}ms`}
        />
      </rect>
    </svg>
  );

  return `url('data:image/svg+xml;charset=utf8,${encodeURIComponent(
    resultSvg
  )}')`;
}
