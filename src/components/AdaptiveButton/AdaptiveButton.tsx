import React, { ComponentProps, ReactElement } from "react";
import AdaptiveContainer from "../AdaptiveContainer";
import Button from "../Button";
import Styles from "./AdaptiveButton.module.scss";

/**
 * A button that automatically adjusts its width to fit the content inside it.
 * This makes the button look natural and not stretched wider than needed.
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
      direction="both"
      {...buttonProps}
    >
      {children}
    </AdaptiveContainer>
  );
}
