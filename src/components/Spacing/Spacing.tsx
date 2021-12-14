import React from "react";
import Styles from "./Spacing.module.scss";

/**
 * A component to inject some spacing between component when required
 **/
export default function Spacing({ size }: { size: "large" | "small" | "stretch" }) {
  return <div className={`${Styles.spacing} ${Styles[`spacing_${size}`]}`} />;
}
