import throttle from "lodash/throttle";
import React, { RefObject, useEffect, useState } from "react";
import Fade from "../../components/FadeIn";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./usePaginationControls.module.scss";
import { isSameTarget } from "../../utils/html.utils";

/**
 * This hook handles the display of pagination controls for the user to move to another page
 */
export default function usePaginationControls(
  containerRef: RefObject<HTMLDivElement>,
  {
    snapToPage,
    baseWidth,
    snapToCutElement: _snapToCutElement,
  }: {
    snapToPage?: boolean;
    baseWidth?: number;
    /** This will scroll only until the partially visible element is at the border, instead of scrolling all the container */
    snapToCutElement?: boolean;
  } = {}
) {
  const [[leftControl, rightControl], setControls] = useState<
    [leftControl: boolean, rightControl: boolean]
  >([false, false]);
  const LeftControl = useOneUIConfig(
    "hook.ui.usePaginationControls.LeftControl"
  );
  const RightControl = useOneUIConfig(
    "hook.ui.usePaginationControls.RightControl"
  );
  const className = useOneUIConfig(
    "hook.ui.usePaginationControls.className",
    ""
  );
  function move(direction: "l" | "r", snapToCutElement = _snapToCutElement) {
    return () => {
      if (snapToCutElement ?? false) {
        const childBaseWidth =
          baseWidth! || containerRef.current!.firstElementChild!.clientWidth;
        const howMuchDoesTheScrollAddsUpTo =
          containerRef.current!.scrollLeft / childBaseWidth -
          Math.floor(containerRef.current!.scrollLeft / childBaseWidth);
        const howMuchElementsFitOnAPage =
          containerRef.current!.clientWidth / childBaseWidth;

        const howMuchElementsFullyFitOnAPage = Math.floor(
          howMuchElementsFitOnAPage
        ) || 1;

        const directionScale =
          direction === "l"
            ? 1 - howMuchDoesTheScrollAddsUpTo
            : howMuchDoesTheScrollAddsUpTo;

        const howMuchOfTheRemainingElementIsShown =
          howMuchElementsFitOnAPage +
          directionScale -
          howMuchElementsFullyFitOnAPage;

        const howMuchToScroll =
          (containerRef.current!.clientWidth -
            childBaseWidth * howMuchOfTheRemainingElementIsShown) *
          (direction === "l" ? -1 : 1);

        console.log("Scrolling", containerRef.current, "to", howMuchToScroll);
        containerRef.current!.scrollBy({
          left: howMuchToScroll,
          behavior: "smooth",
        });
      } else {
        const rest =
          containerRef.current!.scrollLeft % containerRef.current!.clientWidth;
        const snapOffset = snapToPage
          ? direction === "l"
            ? rest
              ? containerRef.current!.clientWidth - rest
              : 0
            : rest
          : 0;
        containerRef.current!.scrollBy({
          left:
            (containerRef.current!.clientWidth - snapOffset) *
            (direction === "l" ? -1 : 1),
          behavior: "smooth",
        });
      }
    };
  }

  function checkControlsRequirement() {
    const el = containerRef.current!;
    const shouldHaveAnyControl = el.scrollWidth > el.clientWidth;
    if (!shouldHaveAnyControl) setControls([false, false]);
    else {
      const shouldHaveRightControl =
        el.scrollLeft < el.scrollWidth - el.clientWidth;
      const shouldHaveLeftControl = el.scrollLeft > 0;

      setControls([shouldHaveLeftControl, shouldHaveRightControl]);
    }
  }
  useEffect(() => {
    const el = containerRef.current!;
    const throttledCheck = throttle(checkControlsRequirement, 1000 / 4);
    checkControlsRequirement();
    let startingX: number | undefined;
    let lastX: number | undefined;

    const onTouchStart = ({ touches, ...e }: TouchEvent) => {
      if (!isSameTarget(e)) return;
      const { pageX } = touches.item(0)!;
      startingX = pageX;
      console.log(startingX);
    };
    const onTouchMove = ({ touches, ...e }: TouchEvent) => {
      if (!isSameTarget(e)) return;
      const touch = touches.item(0);

      lastX = touch!.pageX;
      console.log(lastX.toFixed(0), startingX?.toFixed(0));
    };
    const onTouchEnd = (e: Event) => {
      if (!lastX) return;
      const dir = lastX > startingX! ? "l" : "r";
      console.log("Moving to", dir);
      move(dir, true)();
      startingX = undefined;
    };
    el.addEventListener("scroll", throttledCheck);
    el.addEventListener("touchstart", onTouchStart);
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchmove", onTouchMove);
    return () => {
      el.removeEventListener("scroll", throttledCheck);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return {
    controls: [
      <Fade
        active={leftControl}
        className={`${Styles.left} ${Styles.control} ${className}`}
        data-testid={usePaginationControlsTestIds.LEFT_CONTROL}
        onClick={move("l")}
      >
        {leftControl && <LeftControl />}
      </Fade>,
      <Fade
        active={rightControl}
        className={`${Styles.right} ${Styles.control} ${className}`}
        data-testid={usePaginationControlsTestIds.RIGHT_CONTROL}
        onClick={move("r")}
      >
        {rightControl && <RightControl />}
      </Fade>,
    ],
    checkControlsRequirement,
  };
}

export enum usePaginationControlsTestIds {
  LEFT_CONTROL = "page-l",
  RIGHT_CONTROL = "page-r",
}
