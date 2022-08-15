import React, { ElementRef, ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Button.module.scss";

type ButtonProps = React.PropsWithChildren<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "transparent" | "filled" | "outline";
  }
>;

/**
 * A simple button with the new design
 **/
export function _Button({
  children,
  variant = "transparent",
  className = "",
  ...otherProps
}: ButtonProps) {
  const classNameType = useOneUIConfig("component.button.className", {});
  return (
    <button
      ref={arguments[1]}
      className={`${Styles.button} ${Styles[variant]} ${className} ${classNameType[variant] || ""}`}
      {...otherProps}
    >
      {children}
    </button>
  );
}

export default forwardRef<HTMLButtonElement, ButtonProps>(_Button);
