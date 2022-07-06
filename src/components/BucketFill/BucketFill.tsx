import React, { PropsWithChildren, ReactNode, useEffect, useRef } from "react";
import Styles from "./BucketFill.module.scss";

/**
 * A weird name for a component, but it's objective is to change element colors as the user progresses through a series of steps
 *
 * IT IS NOT READY (AND PROBABLY NEVER WILL) FOR FRAGMENT NODES
 **/
export default function BucketFill({
  children,
  background,
  fillTo,
}: {
  children: ReactNode[];
  fillTo: number;
  background: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  function resize() {
    const childs = rootRef.current!.children;
    const s = rootRef.current!.style;
    const elementAtPosition =
      fillTo === 0 ? null : (childs.item(fillTo - 1) as HTMLElement);
    const elementOffsetAndHeight =
      elementAtPosition === null
        ? 0
        : elementAtPosition.offsetTop + elementAtPosition.clientHeight;
    const elementRootHeight = rootRef.current!.clientHeight;
    const percentToFill = Math.min(
      (elementOffsetAndHeight * 100) / elementRootHeight,
      100
    );

    s.setProperty("--fill-height", `${percentToFill}%`);
    s.setProperty("--empty-height", `${100 - percentToFill}%`);
    s.setProperty(
      "--bg-offset",
      `${percentToFill === 100 ? -1000 : 100 / ((100 - percentToFill) / 100)}%`
    );
  }
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, [fillTo]);
  
  return (
    <div
      ref={rootRef}
      style={
        {
          "--bg": background,
        } as any
      }
      className={Styles.root}
    >
      {children}
    </div>
  );
}

export function IgnoreFill({ children }: PropsWithChildren<{}>) {
  return <div className={Styles.ignoreFill}>{children}</div>;
}
