import React, { ComponentProps, ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Text.module.scss";

/**
 * A component to hold all text variantions
 **/
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
    } & React.HTMLAttributes<HTMLParagraphElement>
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

export default forwardRef(_Text);
