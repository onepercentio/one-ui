import React, { ElementRef, ForwardedRef, forwardRef } from "react";
import Styles from "./Button.module.scss";

/**
 * A simple button with the new design
 **/
function Button(
  {
    children,
    variant = "transparent",
    className = "",
    ...otherProps
  }: React.PropsWithChildren<
    React.ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: "transparent" | "filled" | "outline";
    }
  >,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      ref={ref}
      className={`${Styles.button} ${Styles[variant]} ${className}`}
      {...otherProps}
    >
      {children}
    </button>
  );
}

export default forwardRef(Button);
