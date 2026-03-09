import React from "react";
import Styles from "./Generic.module.scss";

export type GenericProps = {
  checked: boolean;
  hasContent?: boolean;
  className?: string;
};

export default function Generic({
  checked,
  hasContent = false,
  className = "",
}: GenericProps) {
  return (
    <span
      className={`${Styles.generic} ${checked ? Styles.checked : ""} ${
        hasContent ? `${Styles.wContent}` : ""
      } ${className}`}
    >
      <span className={Styles.inner} />
    </span>
  );
}

export { Generic };
