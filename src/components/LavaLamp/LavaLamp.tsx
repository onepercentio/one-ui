import React, { PropsWithChildren, useMemo, useRef } from "react";
import useLavaLampSetup from "./LavaLamp.data";
import Styles from "./LavaLamp.module.scss";

type LavaLampProps = {
  /**
   * Required for defining the dimensions the lava lamp should have
   */
  className: string;
};

/**
 * A peaceful component simulating an interactive lavalamp
 **/
export default function LavaLamp({
  className,
  children,
}: PropsWithChildren<LavaLampProps>) {
  const circleRef = useRef<SVGCircleElement>(null);

  const { relativeTo, d, circlesConfig } = useLavaLampSetup(
    (cx, cy) => {
      const style: any = circleRef.current!.style;
      style.cx = cx;
      style.cy = cy;
    },
    (size) => {
      const style: any = circleRef.current!.style;
      style.r = size;
    }
  );

  const randomCircles = useMemo(() => {
    return circlesConfig.map(
      ({ baseSize, startX, startY, translateX, translateY }) => (
        <circle
          r={baseSize + Math.random() * (baseSize / 2)}
          fill="#fff"
          cx={startX}
          cy={startY}
        >
          <animateTransform
            additive="sum"
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values={`0 0; ${translateX} ${translateY}; 0 0;`}
            dur={`${5 + Math.random() * 5}s`}
            repeatCount="indefinite"
          />
        </circle>
      )
    );
  }, [circlesConfig]);

  return (
    <div ref={relativeTo} className={`${Styles.root} ${className}`}>
      {d && (
        <svg className={Styles.effect} viewBox={`0 0 ${d.width} ${d.height}`}>
          <filter
            id={`goo-lava-lamp`}
            width="10"
            height="10"
            x="0%"
            y="0%"
            filterRes="1"
          >
            <feGaussianBlur
              in="SourceGraphic"
              result="blur"
              stdDeviation="40"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 50 -7"
              result="goo"
            />
          </filter>
          <mask id={`mask-lava-lamp`}>
            <g filter={`url(#${`goo-lava-lamp`})`} fill="#fff">
              {randomCircles}
              <circle ref={circleRef} fill="#fff" />
            </g>
          </mask>
          <defs>
            <radialGradient
              id="grad1"
              cx="50%"
              cy="50%"
              r="50%"
              fx="50%"
              fy="50%"
            >
              <stop
                offset="0%"
                style={{
                  stopColor: "var(--lava-lamp-color-a)",
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="67.33%"
                style={{
                  stopColor: "var(--lava-lamp-color-b)",
                  stopOpacity: 1,
                }}
              />
              <stop
                offset="88.33%"
                style={{
                  stopColor: "var(--lava-lamp-color-c)",
                  stopOpacity: 1,
                }}
              />
            </radialGradient>
          </defs>
          <rect
            x="-50%"
            y="-50%"
            mask={`url(#${`mask-lava-lamp`})`}
            width="200%"
            height="200%"
            style={{ fill: "url(#grad1)" }}
          ></rect>
        </svg>
      )}
      <div>{children}</div>
    </div>
  );
}
