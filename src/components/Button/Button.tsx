import React, { ElementRef, ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Button.module.scss";

type ButtonProps = React.PropsWithChildren<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: OnepercentUtility.UIElements.ButtonVariants;
  }
>;

export function _Button(
  {
    children,
    variant = "transparent",
    className = "",
    ...otherProps
  }: ButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  const classNameType = useOneUIConfig("component.button.className", {});
  const Component = useOneUIConfig(
    "component.button.Component",
    "button" as any
  );
  return (
    <Component
      ref={ref}
      className={`${Styles.button} ${Styles[variant]} ${className} ${
        classNameType[variant] || ""
      }`}
      variant={variant}
      {...otherProps}
    >
      {children}
    </Component>
  );
}


/**
 * A simple button that can be customized via the provider
 **/
const Button = forwardRef<HTMLButtonElement, ButtonProps>(_Button);
export default Button;
