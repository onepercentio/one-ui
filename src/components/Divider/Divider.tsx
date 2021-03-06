import React from "react";
import Styles from "./Divider.module.scss";

/**
 * Guess what this does
 **/
export default function Divider({className = ""}: {className?: string}) {
  return (
    <>
      <div className={`${Styles.container} ${className}`} />
    </>
  );
}
