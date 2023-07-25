import React, { ComponentProps, useMemo } from "react";
import Styles from "./ProgressBar.module.scss";

/**
 * Shows a progress bar
 **/
export default function ProgressBar({
  size,
  progress,
  style = "guide",
}: {
  /**
   * Given as css font size
   */
  size: number | string;
  /**
   * Given in percent
   */
  progress: number;

  style?: "gauge" | "guide";
}) {
  return (
    <div
      className={`${Styles.container} ${Styles[style]} ${
        progress === 100 ? Styles.completed : ""
      }`}
      style={{ fontSize: size }}
    >
      <span style={{ width: `${progress}%` }} />
      {style === "guide" && <span style={{ left: `${progress}%` }} />}
    </div>
  );
}

export function BalancedProgressBar({
  min,
  max,
  current,
  size,
  style,
}: {
  min: number;
  max: number;
  current: number;
} & Pick<ComponentProps<typeof ProgressBar>, "size" | "style">) {
  const progress = useMemo(() => {
    const progressVal = current - min;
    const maxVal = max - min;

    const currProgress = (progressVal * 100) / maxVal;

    return currProgress;
  }, [min, max, current]);

  return <ProgressBar size={size} progress={progress} style={style} />;
}
