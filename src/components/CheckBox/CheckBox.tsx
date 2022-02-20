import React, { PropsWithChildren } from "react";
import Styles from "./CheckBox.module.scss";

/**
 * A simple checkbox with nissan guidelines
 **/
export default function CheckBox({
  checked,
  onToggle,
  label,
  className = "",
  size = undefined,
  ...props
}: PropsWithChildren<{
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  size?: number;
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >) {
  return (
    <span
      className={`${Styles.container} ${className}`}
      style={{ fontSize: size }}
    >
      <span
        {...props}
        onClick={(e) => {
          onToggle(!checked);
          e.preventDefault();
        }}
        className={checked ? Styles.checked : ""}
      />
      {label}
    </span>
  );
}
