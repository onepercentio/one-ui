import React, { ComponentProps, ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Text.module.scss";

export function _Text(
  {
    type,
    children,
    className = "",
    ...otherProps
  }: React.PropsWithChildren<
    {
      className?: string;
      type: OnepercentUtility.UIElements.TextVariants;
      color?: OnepercentUtility.UIElements.TextColors;
    } & Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">
  >,
  _ref?: ForwardedRef<HTMLParagraphElement>
) {
  const classNameType = useOneUIConfig("component.text.className", {});
  const tagByType = useOneUIConfig("component.text.htmlTag", {});

  const TagType = tagByType[type] || "p";

  return (
    <TagType
      ref={_ref}
      className={`${Styles.text} ${
        classNameType[type] || Styles[type]
      } ${className} ${otherProps.onClick ? Styles.iteractible : ""}`}
      {...otherProps}
    >
      {children}
    </TagType>
  );
}

/**
 * A component to hold all text variantions
 **/
const Text = forwardRef(_Text);
export default Text;
