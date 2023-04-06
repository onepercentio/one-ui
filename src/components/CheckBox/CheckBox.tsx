import React, { PropsWithChildren } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
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
  const Checkbox = useOneUIConfig(
    "component.checkbox.Component",
    "span" as any
  ) as any;
  return (
    <label
      className={`${Styles.container} ${className}`}
      style={{ fontSize: size }}
      onClick={(e) => {
        onToggle(!checked);
        e.preventDefault();
      }}
    >
      <Checkbox
        {...props}
        className={`${checked ? Styles.checked : ""} ${
          label ? Styles.wContent : ""
        }`}
      />
      {label}
    </label>
  );
}
