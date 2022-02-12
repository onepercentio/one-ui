import React from "react";
import Styles from "./MutableHamburgerButton.module.scss";

/**
 * A hamburger button that mutates according to it's state
 **/
export default function MutableHamburgerButton({
  state = "default",
  size,
}: {
  state?: "default" | "closed" | "arrow-up" | "arrow-down";
  size: number;
}) {
  return (
    <div
      className={`${Styles.container} ${Styles[state]}`}
      style={{ fontSize: `${size}px` }}
    >
      <div />
      <div />
      <div />
    </div>
  );
}
