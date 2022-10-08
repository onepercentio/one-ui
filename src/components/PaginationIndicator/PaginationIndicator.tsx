import React from "react";
import Styles from "./PaginationIndicator.module.scss";

/**
 * A cool component to indicate how many pages are
 **/
export default function PaginationIndicator({ size }: { size: number }) {
  return (
    <div className={Styles.root} style={{ fontSize: `${size}px` }}>
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
