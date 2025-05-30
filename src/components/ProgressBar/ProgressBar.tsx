import React, {
  ComponentProps,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Styles from "./ProgressBar.module.scss";

/**
 * Shows a progress bar
 **/
export default function ProgressBar({
  progress,
  ...props
}: {
  /**
   * Given in percent
   */
  progress: number;
} & (
  | {
      /**
       * Given as css font size
       */
      size: number | string;
      mode?: "gauge" | "guide";
    }
  | {
      /**
       * Given as pixels
       */
      size: number;
      mode?: "sections";
      /** The number of sections to split */
      sections: number;
    }
)) {
  if (props.mode === "sections") {
    const ref = useRef<SVGSVGElement>(null);
    const strokeID = useMemo(
      () => `stroke-${(Math.random() * 100000).toFixed(0)}`,
      []
    );
    const height = props.size;
    const [width, setWidth] = useState(0);
    const dashWidth = width / props.sections;
    const spacing = dashWidth * 0.2;
    useEffect(() => {
      setWidth(ref.current!.clientWidth);
    }, []);
    return (
      <svg
        ref={ref}
        viewBox={`${-height / 2} 0 ${width + height - spacing} ${height}`}
        preserveAspectRatio="none"
        width={"100%"}
        height={`${height}px`}
      >
        <defs>
          <linearGradient
            id={`${strokeID}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stop-color="blue" />
            <stop offset={`${progress}%`} stop-color="blue" />
            <stop offset={`${progress}%`} stop-color="green" />
            <stop offset="100%" stop-color="green" />
          </linearGradient>
        </defs>
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={`url(#${strokeID})`}
          stroke-width={height}
          stroke-dasharray={`${dashWidth - spacing},${spacing}`}
          stroke-linecap="round"
        />
      </svg>
    );
  }
  const mode = props.mode || "guide";
  const size = props.size;
  return (
    <div
      className={`${Styles.container} ${Styles[mode]} ${
        progress === 100 ? Styles.completed : ""
      }`}
      style={{ fontSize: size }}
    >
      <span style={{ width: `${progress}%` }} />
      {mode === "guide" && <span style={{ left: `${progress}%` }} />}
    </div>
  );
}

export function BalancedProgressBar({
  min,
  max,
  current,
  size,
  mode,
}: {
  min: number;
  max: number;
  current: number;
} & Pick<ComponentProps<typeof ProgressBar>, "size" | "mode">) {
  const progress = useMemo(() => {
    const progressVal = current - min;
    const maxVal = max - min;

    const currProgress = (progressVal * 100) / maxVal;

    return currProgress;
  }, [min, max, current]);

  return <ProgressBar size={size} progress={progress} mode={mode} />;
}
