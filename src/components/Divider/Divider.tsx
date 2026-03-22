import React from "react";
import Styles from "./Divider.module.scss";

export default function Divider({className = ""}: {className?: string}) {
  return (
    <>
      <div className={`${Styles.container} ${className}`} />
    </>
  );
}
