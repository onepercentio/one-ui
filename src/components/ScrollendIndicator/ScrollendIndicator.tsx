import { useEffect, useRef } from "react";
import styles from "./ScrollendIndicator.module.scss";

export type ScrollendIndicatorDirection = "vertical" | "horizontal";

export interface ScrollendIndicatorProps {
  direction?: ScrollendIndicatorDirection;
  forceRelativePosition?: boolean;
  indicatorSize?: number;
  maxGradientScroll?: number;
}

const ScrollendIndicator: React.FC<ScrollendIndicatorProps> = ({
  direction = "vertical",
  forceRelativePosition = false,
  indicatorSize = 40,
  maxGradientScroll = 200,
}) => {
  const showTop = direction === "vertical";
  const showBottom = direction === "vertical";
  const showLeft = direction === "horizontal";
  const showRight = direction === "horizontal";
  const ref = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;

    let scrollParent: HTMLElement | null = el;
    while (scrollParent && scrollParent !== document.documentElement) {
      const style = getComputedStyle(scrollParent);
      if (
        style.overflow !== "visible" ||
        style.overflowX !== "visible" ||
        style.overflowY !== "visible"
      ) {
        break;
      }
      scrollParent = scrollParent.parentElement;
    }

    if (!scrollParent) return;

    if (forceRelativePosition) {
      const currentPos = getComputedStyle(scrollParent).position;
      if (currentPos !== "static" && currentPos !== "initial") {
        console.warn(
          `[ScrollendIndicator] Parent element has position "${currentPos}". ` +
            `Setting to "relative" may cause layout conflicts.`
        );
      }
      scrollParent.style.position = "relative";
    }

    const handleScroll = () => {
      const {
        scrollTop,
        scrollLeft,
        scrollHeight,
        scrollWidth,
        clientHeight,
        clientWidth,
      } = scrollParent!;

      if (direction === "vertical") {
        const topRemaining = scrollTop;
        const bottomRemaining = Math.max(
          0,
          scrollHeight - scrollTop - clientHeight
        );
        const topRadius = Math.min(
          50,
          Math.max(0, 50 * (topRemaining / maxGradientScroll))
        );
        const bottomRadius = Math.min(
          50,
          Math.max(0, 50 * (bottomRemaining / maxGradientScroll))
        );

        if (topRef.current)
          topRef.current.style.setProperty("--radius", `${topRadius}%`);
        if (bottomRef.current)
          bottomRef.current.style.setProperty("--radius", `${bottomRadius}%`);
      } else {
        const leftRemaining = scrollLeft;
        const rightRemaining = Math.max(
          0,
          scrollWidth - scrollLeft - clientWidth
        );
        const leftRadius = Math.max(
          0,
          50 * (1 - leftRemaining / maxGradientScroll)
        );
        const rightRadius = Math.max(
          0,
          50 * (1 - rightRemaining / maxGradientScroll)
        );

        if (leftRef.current)
          leftRef.current.style.setProperty("--radius", `${leftRadius}%`);
        if (rightRef.current)
          rightRef.current.style.setProperty("--radius", `${rightRadius}%`);
      }
    };

    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => scrollParent?.removeEventListener("scroll", handleScroll);
  }, [direction, forceRelativePosition, indicatorSize, maxGradientScroll]);

  return (
    <div
      ref={ref}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      {showTop && (
        <div
          ref={topRef}
          className={styles.indicator}
          data-position="top"
          style={{ "--size": `${indicatorSize}px` } as React.CSSProperties}
        />
      )}
      {showBottom && (
        <div
          ref={bottomRef}
          className={styles.indicator}
          data-position="bottom"
          style={{ "--size": `${indicatorSize}px` } as React.CSSProperties}
        />
      )}
      {showLeft && (
        <div
          ref={leftRef}
          className={styles.indicator}
          data-position="left"
          style={{ "--size": `${indicatorSize}px` } as React.CSSProperties}
        />
      )}
      {showRight && (
        <div
          ref={rightRef}
          className={styles.indicator}
          data-position="right"
          style={{ "--size": `${indicatorSize}px` } as React.CSSProperties}
        />
      )}
    </div>
  );
};

export default ScrollendIndicator;
