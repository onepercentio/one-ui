import React from "react";
import Styles from "./Checkmark.module.scss";

export type CheckmarkProps = {
  checked: boolean;
  hasContent?: boolean;
  className?: string;
};

export function Checkmark({ checked, hasContent = false, className = "" }: CheckmarkProps) {
  return (
    <span
      className={`${Styles.checkmark} ${checked ? Styles.checked : ""} ${
        hasContent ? `${Styles.wContent}` : ""
      } ${className}`}
    />
  );
}
