import React, { ElementRef, ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import { FromOnePercentUtility } from "../../type-utils";

type Props = {
  variant?: FromOnePercentUtility<"UIElements.ButtonVariants">;
};

function Button(
  {
    children,
    variant = "transparent",
    className = "",
    ...otherProps
  }: React.PropsWithChildren<
    Props & React.ButtonHTMLAttributes<HTMLButtonElement>
  >,
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
      className={`${className} ${classNameType[variant] || ""}`}
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
export default forwardRef(Button);
