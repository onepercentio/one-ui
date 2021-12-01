import React from "react";
import Styles from "./Button.module.scss";

/**
 * A simple button with the new design
 **/
export default function Button({
  children,
  variant = "transparent",
  className = "",
  ...otherProps
}: React.PropsWithChildren<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "transparent" | "filled" | "outline";
  }
>) {
  return (
    <button
      className={`${Styles.button} ${Styles[variant]} ${className}`}
      {...otherProps}
    >
      {children}
    </button>
  );
}
