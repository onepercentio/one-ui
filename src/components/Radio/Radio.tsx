/**
 * A custom radio button component that allows users to select one option from a group.
 * It displays a label and can be customized with different sizes and styling.
 */
import React, { PropsWithChildren } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Radio.module.scss";
import { Checkmark } from "./variants/Checkmark/Checkmark";

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
  "data-testid"?: string;
}> &
  React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  >) {
  const Checkbox = useOneUIConfig(
    "component.radio.Component",
    Checkmark as any
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
      <Checkbox checked={checked} hasContent={!!label} {...props} />
      <input
        type="radio"
        name={groupId}
        id={value}
        value={value}
        checked={checked}
        readOnly
        data-testid={props["data-testid"]}
      />
      {label}
    </label>
  );
}