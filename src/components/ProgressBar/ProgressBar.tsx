import React, { ComponentProps, useMemo } from "react";
import Styles from "./ProgressBar.module.scss";

/**
 * Shows a progress bar
 **/
export default function ProgressBar({
  size,
  progress,
  mode = "guide",
}: {
  /**
   * Given as css font size
   */
  size: number | string;
  /**
   * Given in percent
   */
  progress: number;

  mode?: "gauge" | "guide";
}) {
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
