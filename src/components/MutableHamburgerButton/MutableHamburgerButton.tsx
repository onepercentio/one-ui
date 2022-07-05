import React from "react";
import Styles from "./MutableHamburgerButton.module.scss";

/**
 * A hamburger button that mutates according to it's state
 **/
export default function MutableHamburgerButton({
  state = "default",
  size,
  className = "",
  ...props
}: {
  state?: "default" | "closed" | "arrow-up" | "arrow-down" | "search" | "loading" | "checkmark";
  size: number;
} & React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={`${Styles.container} ${Styles[state]} ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      <div />
      <div />
      <div />
    </div>
  );
}
