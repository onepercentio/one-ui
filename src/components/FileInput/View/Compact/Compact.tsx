import React, { useMemo } from "react";
import Styles from "./Compact.module.scss";
import { FileInputViewProps } from "../View.types";
import UncontrolledTransition from "../../../UncontrolledTransition/UncontrolledTransition";
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
      className={`${Styles.root} ${className}`}
      style={
        {
          "--progress-stroke-dasharray": progressDashArray,
        } as any
      }
    >
      <UncontrolledTransition
        transitionType={TransitionAnimationTypes.COIN_FLIP}
      >
        <Button variant="transparent" key={statusClass} onClick={onAction}>
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
          </svg>
        </Button>
      </UncontrolledTransition>
      <div>
        <p>{state.title}</p>
        {state.description && <p>{state.description}</p>}
        <p>{footer}</p>
      </div>
      {inputEl}
    </div>
  );
}
