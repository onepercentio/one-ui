import React, { ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Text.module.scss";

/**
 * A component to hold all text variantions
 **/
function Text(
  {
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
  >,
  ref: ForwardedRef<HTMLParagraphElement>
) {
  const classNameType = useOneUIConfig("component.text.className", {});

  return (
    <p
      ref={ref}
      className={`${Styles.text} ${
        classNameType[type] || Styles[type]
      } ${className} ${otherProps.onClick ? Styles.iteractible : ""}`}
      {...otherProps}
    >
      {children}
    </p>
  );
}

export default forwardRef(Text);
