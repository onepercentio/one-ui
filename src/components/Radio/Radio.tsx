import React, { PropsWithChildren } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Radio.module.scss";

/**
 * A simple radio with nice guidelines
 **/
export default function Radio({
  checked,
  onToggle,
  label,
  className = "",
  size = undefined,
  groupId,
  value,
  ...props
}: PropsWithChildren<{
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  size?: number;
  groupId: string;
  value: string;
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >) {
  const Checkbox = useOneUIConfig(
    "component.radio.Component",
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
      <input type="radio" name={groupId} id={value} checked={checked} />
      {label}
    </label>
  );
}
