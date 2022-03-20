import React from "react";
import Styles from "./Loader.module.scss";

/**
 * A simple loader
 **/
export default function Loader({ className = "" }: { className?: string }) {
  return (
    <span className={`${Styles.indicator} ${className}`}>
      <span />
      <span />
      <span />
    </span>
  );
}
