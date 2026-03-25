import React, { useMemo } from "react";
import Styles from "./Avatar.module.scss";

/**
 * A simple avatar that shows the user's image or their initials as a fallback
 * This component displays a person's profile picture or generates their initials
 * if no picture is available
 **/
export default function Avatar({
  name,
  imgSrc,
  size = 48,
}: {
  imgSrc?: string;
  name: string;
  size?: number;
}) {
  const initials = useMemo(() => {
    const nameParts = name.trim().split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    const [firstName, lastName] = [nameParts[0], nameParts.slice(-1)[0]];
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, [name]);
  return (
    <div
      className={`${Styles.container} ${imgSrc ? "" : Styles.noImg}`}
      style={{ fontSize: size }}
      title={name}
    >
      {imgSrc ? <img src={imgSrc} alt={name} /> : <span>{initials}</span>}
    </div>
  );
}