import { useLayoutEffect, useRef } from "react";
import Styles from "./useSnapToViewport.module.scss";
/**
 * This takes a container and applies padding and margin so the content overflow container and goes until it hits the viewport border
 */
export default function useSnapToViewport(defaultPadding: number) {
  const elRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const diff = window.visualViewport!.width - elRef.current!.clientWidth;

    const margin = diff / 2;

    elRef.current!.style.setProperty("--overflow-padding", `${margin}px`);
    elRef.current!.style.setProperty("--overflow-margin", `${-margin}px`);
    elRef.current!.style.setProperty(
      "--default-padding",
      `${defaultPadding}px`
    );
    elRef.current!.style.setProperty(
      "--default-margin",
      `${-defaultPadding}px`
    );
    elRef.current!.classList.add(Styles.applySpacings);
  }, []);

  return elRef;
}
