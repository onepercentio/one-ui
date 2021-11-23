import React from "react";
import Styles from "./Button.module.scss";

/**
 * A simple button with the new design
 **/
export default function Button({
  children,
  ...otherProps
}: React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>) {
  return <button className={Styles.button} {...otherProps}>{children}</button>;
}
