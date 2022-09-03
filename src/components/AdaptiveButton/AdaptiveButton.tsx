import React, {
  ComponentProps,
  ElementRef,
  ReactElement,
  useEffect,
  useRef,
} from "react";
import AdaptiveContainer from "../AdaptiveContainer";
import Button from "../Button";

/**
 * A button that adapts it's width according to the content size
 **/
export default function AdaptiveButton({
  children,
  className = "",
  ...buttonProps
}: {
  children: ReactElement;
} & ComponentProps<typeof Button>) {
  return (
    <AdaptiveContainer
      containerElement={Button}
      className={className}
      {...buttonProps}
    >
      {children}
    </AdaptiveContainer>
  );
}
