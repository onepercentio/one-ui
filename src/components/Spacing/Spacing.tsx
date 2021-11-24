import React from "react";
import Styles from "./Spacing.module.scss";

/**
 * A component to inject some spacing between component when required
 **/
export default function Spacing({ size }: { size: "33" | "15" | "stretch" }) {
  return <div className={`${Styles.spacing} ${Styles[`spacing_${size}`]}`} />;
}
