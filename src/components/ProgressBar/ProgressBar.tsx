import React from "react";
import Styles from "./ProgressBar.module.scss";

/**
 * Shows a progress bar
 **/
export default function ProgressBar({
  size,
  progress,
}: {
  /**
   * Given as css font size
   */
  size: number | string;
  /**
   * Given in percent
   */
  progress: number;
}) {
  return (
    <div className={Styles.container} style={{ fontSize: size }}>
      <span style={{ width: `${progress}%` }} />
      <span style={{ left: `${progress}%` }} />
    </div>
  );
}
