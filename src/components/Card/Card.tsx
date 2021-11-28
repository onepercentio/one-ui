import React, { PropsWithChildren } from "react";
import Styles from "./Card.module.scss";

/**
 * A card layout that holds content
 **/
export default function Card({ children, className = "" }: PropsWithChildren<{className?: string}>) {
  return <div className={`${Styles.container} ${className}`}>{children}</div>;
}
