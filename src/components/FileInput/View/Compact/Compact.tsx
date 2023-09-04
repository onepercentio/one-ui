import React, { useMemo } from "react";
import Styles from "./Compact.module.scss";
import { FileInputViewProps } from "../View.types";
import _UncontrolledTransition from "../../../UncontrolledTransition/UncontrolledTransition";
import { TransitionAnimationTypes } from "../../../Transition";
import Button from "../../../Button/Button";

/**
 * Shows the file submission input in a more compact form
 **/
export default function Compact({
  states,
  file,
  footer,
  inputEl,
  onAction,
  progress,
  className,
  disabled,
}: FileInputViewProps) {
  const state = states[file ? "fileProvided" : "waitingFile"];
  const statusClass =
    progress !== undefined && progress < 100
      ? "loading"
      : file
      ? "completed"
      : "waiting";

  const progressDashArray = useMemo(() => {
    if (progress !== undefined) {
      const strokePercent = (progress * 300) / 100;

      return `${strokePercent}% ${300 - strokePercent}%`;
    }
  }, [progress]);

  const polylines = useMemo(() => {
    switch (statusClass) {
      case "completed":
        return [
          "rotate(45, 23, 23.5)",
          "14 23.9, 23 23.9, 32 23.9",
          "23 14.8 23 33",
        ];
      case "loading":
        return ["", "18 23.9, 23 18.8, 28 23.9", "23 18.8 23 29"];
      default:
        return ["", "18 23.9, 23 23.9, 28 23.9", "23 18.8 23 29"];
    }
  }, [statusClass]);

  return (
    <div
      className={`${Styles.root} ${className} ${
        disabled ? Styles.disabled : ""
      }`}
      onClick={onAction}
      style={
        {
          "--progress-stroke-dasharray": progressDashArray,
        } as any
      }
    >
      <_UncontrolledTransition
        transitionType={TransitionAnimationTypes.COIN_FLIP}
      >
        <Button variant="transparent" key={statusClass}>
          <svg
            viewBox="0 0 46 47"
            className={Styles[statusClass]}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="23"
              cy="23.859"
              r="22"
              style={{ stroke: "var(--svg-color, #000)" }}
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            {statusClass === "completed" ? (
              <g transform="translate(11, 11)">
                <path
                  d="M22 11.0801V12.0001C21.9988 14.1565 21.3005 16.2548 20.0093 17.9819C18.7182 19.7091 16.9033 20.9726 14.8354 21.584C12.7674 22.1954 10.5573 22.122 8.53447 21.3747C6.51168 20.6274 4.78465 19.2462 3.61096 17.4372C2.43727 15.6281 1.87979 13.4882 2.02168 11.3364C2.16356 9.18467 2.99721 7.13643 4.39828 5.49718C5.79935 3.85793 7.69279 2.71549 9.79619 2.24025C11.8996 1.76502 14.1003 1.98245 16.07 2.86011"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M22 4L12 14.01L9 11.01"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            ) : (
              <g transform={polylines[0]}>
                <polyline
                  points={polylines[1]}
                  stroke-width="2.8"
                  style={{ stroke: "var(--svg-color, #000)" }}
                  stroke-linecap="round"
                />
                <polyline
                  points={polylines[2]}
                  stroke-width="2.8"
                  style={{ stroke: "var(--svg-color, #000)" }}
                  stroke-linecap="round"
                />
              </g>
            )}
          </svg>
        </Button>
      </_UncontrolledTransition>
      <div>
        <p>{state.title}</p>
        {state.description && <p>{state.description}</p>}
        <p>{footer}</p>
      </div>
      {inputEl}
    </div>
  );
}
