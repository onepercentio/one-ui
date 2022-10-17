import React from "react";
import Styles from "./Loader.module.scss";

/**
 * A simple loader
 **/
export default function Loader({
  className = "",
  ...props
}: { className?: string } & React.HTMLProps<HTMLDivElement>) {
  return (
    <span className={`${Styles.indicator} ${className}`} {...props}>
      <span />
      <span />
      <span />
    </span>
  );
}
