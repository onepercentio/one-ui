import React from "react";
import Styles from "./Divider.module.scss";

/**
 * A simple horizontal line used to visually separate content.
 */
export default function Divider({className = ""}: {className?: string}) {
  return (
    <>
      <div className={`${Styles.container} ${className}`} />
    </>
  );
}