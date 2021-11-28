import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import Styles from "./FadeIn.module.scss";

/**
 * Receives a children and displays it with a fade in animation, also when it's removed, it hides with a fadeout
 **/
export default function FadeIn({
  children,
  className = "",
  active,
}: PropsWithChildren<{ className?: string; active?: boolean }>) {
  const [, trigger] = useState(0);
  const divRef = useRef<HTMLDivElement>(null);
  const prevChildren = useRef<typeof children>();
  prevChildren.current = children || prevChildren.current;

  useEffect(() => {
    const el = divRef.current!;
    const isElHidden = active !== undefined ? !active : !children;

    if (isElHidden) {
      el.classList.remove(Styles.active);
      const handler = () => {
        prevChildren.current = null;
        trigger((a) => a + 1);
      };
      el.addEventListener("transitionend", handler);
      return () => {
        el.removeEventListener("transitionend", handler);
      };
    } else {
      el.classList.add(Styles.active);
    }
  }, [children, active]);
  return (
    <div
      ref={divRef}
      data-testid="fadein_container"
      className={`${Styles.container} ${className}`}
    >
      {prevChildren.current}
    </div>
  );
}
