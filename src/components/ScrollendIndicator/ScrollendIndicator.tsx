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
  const viewportRef = useRef<HTMLDivElement>(null);
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

    // The bands ride a sticky box the size of the scrollport, so the browser keeps them
    // in view on the compositor. Re-pinning them from the `scroll` event instead would
    // land a frame late (a transparent strip under the gradient while scrolling) and,
    // because the offset pushed them past the content, it also grew the scrollable area
    // on every scroll.
    // `inset: 0` on an absolute child of a scroller resolves against the padding box, so
    // the wrapper would be scrollport-sized and anchored at the content origin — it would
    // scroll away and leave the sticky band no room to travel. Stretching it to the whole
    // content (never beyond, so it adds no overflow) gives the band the full range.
    const syncViewport = () => {
      if (ref.current) {
        if (direction === "vertical")
          ref.current.style.height = `${scrollParent!.scrollHeight}px`;
        else ref.current.style.width = `${scrollParent!.scrollWidth}px`;
      }
      if (!viewportRef.current) return;
      const size =
        direction === "vertical"
          ? scrollParent!.clientHeight
          : scrollParent!.clientWidth;
      viewportRef.current.style.setProperty("--viewport", `${size}px`);
    };

    const handleScroll = () => {
      syncViewport();
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
          Math.min(50, 50 * (leftRemaining / maxGradientScroll))
        );
        const rightRadius = Math.max(
          0,
          Math.min(50, 50 * (rightRemaining / maxGradientScroll))
        );

        if (leftRef.current)
          leftRef.current.style.setProperty("--radius", `${leftRadius}%`);
        if (rightRef.current)
          rightRef.current.style.setProperty("--radius", `${rightRadius}%`);
      }
    };

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            syncViewport();
            handleScroll();
          })
        : undefined;
    observer?.observe(scrollParent);
    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    syncViewport();
    handleScroll();

    return () => {
      observer?.disconnect();
      scrollParent?.removeEventListener("scroll", handleScroll);
    };
  }, [direction, forceRelativePosition, indicatorSize, maxGradientScroll]);

  return (
    <div
      ref={ref}
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    >
      <div ref={viewportRef} className={styles.viewport} data-direction={direction}>
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
    </div>
  );
};

export default ScrollendIndicator;
