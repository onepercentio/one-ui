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
  ...props
}: {
  enabled: boolean;
  onToggle: (newState: boolean) => void;
  size: number;
} & Omit<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  "ref"
>) {
  return (
    <>
      <div
        style={{ fontSize: `${size}px` }}
        className={`${Styles.root} ${enabled ? Styles.enabled : ""}`}
        onClick={() => onToggle(!enabled)}
        {...props}
      >
        <div className={Styles.toggler} />
      </div>
    </>
  );
}
