import React, { useMemo } from "react";
import Styles from "./Spacing.module.scss";
import { useOneUIConfig } from "../../context/OneUIProvider";
import { FromOnePercentUtility } from "../../type-utils";

/**
 * A component to inject some spacing between component when required
 **/

/**
 * A simple spacer that adds breathing room between UI elements.
 * It creates an empty space that can be sized large, small, or stretched to fill available space.
 */
export default function Spacing({
  size,
}: {
  size: FromOnePercentUtility<'UIElements.SpacingVariants'> | "stretch";
}) {
  const spacingClasses = useOneUIConfig("component.spacing.variants", {
    large: Styles.spacing_large,
    small: Styles.spacing_small,
  });

  const cls = useMemo(
    () => (size === "stretch" ? Styles.spacing_stretch : spacingClasses[size]),
    [size]
  );

  return <div className={`${Styles.spacing} ${cls}`} />;
}