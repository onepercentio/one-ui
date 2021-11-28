import React from "react";
import Styles from "./Loader.module.scss";

/**
 * A simple loader
 **/
export default function Loader() {
  return (
    <span className={Styles.indicator}>
      <span />
      <span />
      <span />
    </span>
  );
}
