import React from "react";
import Styles from "./Text.module.scss";

/**
 * A component to hold all text variantions
 **/
export default function Text({
  type,
  children,
  className = "",
  ...otherProps
}: React.PropsWithChildren<
  {
    className?: string;
    type:
      | "title"
      | "description"
      | "error"
      | "caption"
      | "highlightTitle"
      | "highlight"
      | "subtitle"
      | "boldTitle"
      | "link"
      | "boldTitleBig"
      | "content";
  } & React.HTMLAttributes<HTMLParagraphElement>
>) {
  return (
    <p
      className={`${Styles.text} ${Styles[type]} ${className} ${
        otherProps.onClick ? Styles.iteractible : ""
      }`}
      {...otherProps}
    >
      {children}
    </p>
  );
}
