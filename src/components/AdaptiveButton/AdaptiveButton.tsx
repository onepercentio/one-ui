import React, { ComponentProps, ReactElement } from "react";
import AdaptiveContainer from "../AdaptiveContainer";
import Button from "../Button";
import Styles from "./AdaptiveButton.module.scss";

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
      className={`${Styles.resetButton} ${className}`}
      {...buttonProps}
    >
      {children}
    </AdaptiveContainer>
  );
}
