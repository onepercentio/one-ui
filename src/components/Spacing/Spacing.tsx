import React, { useMemo } from "react";
import Styles from "./Spacing.module.scss";
import { useOneUIConfig } from "../../context/OneUIProvider";

/**
 * A component to inject some spacing between component when required
 **/
export default function Spacing({
  size,
}: {
  size: OnepercentUtility.UIElements.SpacingVariants | "stretch";
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
