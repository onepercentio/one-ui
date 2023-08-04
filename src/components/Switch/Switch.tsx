import React, {
  ComponentProps,
  DetailedHTMLProps,
  HTMLAttributes,
} from "react";
import Styles from "./Switch.module.scss";

/**
 * Switchs between states
 **/
export default function Switch({
  enabled,
  onToggle,
  size,
  disabled,
  ...props
}: {
  enabled: boolean;
  onToggle: (newState: boolean) => void;
  size: number;
  disabled?: boolean;
} & Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref"
>) {
  return (
    <>
      <div
        style={{ fontSize: `${size}px` }}
        className={`${Styles.root} ${enabled ? Styles.on : ""} ${
          disabled ? Styles.disabled : ""
        }`}
        onClick={() => onToggle(!enabled)}
        {...props}
      >
        <div className={Styles.toggler} />
        <input checked={enabled} type="checkbox" />
      </div>
    </>
  );
}
