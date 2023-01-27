import React from "react";
import Styles from "./Skeleton.module.scss";

/**
 * A skeleton element used to display a content that is loading
 *
 * Usually, it is used for paragraph elements, with a specific size
 * So it's width and height is translated to em units
 **/
export default function Skeleton({
  width,
  height = 1,
}: {
  width: number;
  height?: number;
}) {
  return (
    <span
      className={Styles.root}
      style={
        {
          "--biggest-unit": `${Math.max(width, height) * 2}em`,
          width: `${width}em`,
          height: `${height}em`,
        } as any
      }
    />
  );
}
