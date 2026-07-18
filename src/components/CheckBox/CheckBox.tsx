import React, { PropsWithChildren } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./CheckBox.module.scss";

/**
 * A simple checkbox with nissan guidelines
 * 
 * This component displays a checkbox that users can click to toggle between checked and unchecked states.
 * It shows a label next to the checkbox and supports custom sizing and grouping.
 * When disabled, it renders muted and ignores toggles.
 **/
export default function CheckBox({
  checked,
  onToggle,
  label,
  className = "",
  size = undefined,
  groupId,
  value,
  disabled = false,
  ...props
}: PropsWithChildren<{
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label: React.ReactNode;
  className?: string;
  size?: number;
  groupId: string;
  value: string;
  disabled?: boolean;
}> &
  Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLSpanElement>,
      HTMLSpanElement
    >,
    "onToggle"
  >) {
  const Checkbox = useOneUIConfig(
    "component.checkbox.Component",
    "span" as any
  ) as any;
  return (
    <label
      className={`${Styles.container} ${disabled ? Styles.disabled : ""} ${className}`}
      style={{ fontSize: size }}
      onClick={(e) => {
        e.preventDefault();
        if (disabled) return;
        onToggle(!checked);
      }}
    >
      <Checkbox
        {...props}
        className={`${checked ? Styles.checked : ""} ${
          label ? Styles.wContent : ""
        }`}
      />
      <input
        type="checkbox"
        name={groupId}
        id={value}
        checked={checked}
        disabled={disabled}
        readOnly
      />

      {label}
    </label>
  );
}
