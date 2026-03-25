import React, { ComponentProps, ForwardedRef, forwardRef } from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./Text.module.scss";
import { FromOnePercentUtility } from "../../type-utils";

export function _Text(
  {
    type,
    children,
    className = "",
    ...otherProps
  }: React.PropsWithChildren<
    {
      className?: string;
      type: FromOnePercentUtility<'UIElements.TextVariants'>;
      color?: FromOnePercentUtility<'UIElements.TextColors'>;
    } & Omit<React.HTMLAttributes<HTMLParagraphElement>, "color">
  >,
  _ref?: ForwardedRef<HTMLParagraphElement>
) {
  const classNameType = useOneUIConfig("component.text.className", {});
  const tagByType = useOneUIConfig("component.text.htmlTag", {});

  const TagType: any = tagByType[type as keyof typeof tagByType] || "p";

  return (
    <TagType
      ref={_ref}
      className={`${Styles.text} ${classNameType[type as keyof typeof classNameType]
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

/**
 * A reusable component that displays styled text with different sizes and colors.
 * It automatically applies the correct HTML tag and styling based on the text type.
 */
export default Text;