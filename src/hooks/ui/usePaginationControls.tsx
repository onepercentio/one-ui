import throttle from "lodash/throttle";
import React, { RefObject, useEffect, useState } from "react";
import Fade from "../../components/FadeIn";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Styles from "./usePaginationControls.module.scss";

/**
 * This hook handles the display of pagination controls for the user to move to another page
 */
export default function usePaginationControls(
  containerRef: RefObject<HTMLDivElement>,
  {
    snapToPage,
  }: {
    snapToPage?: boolean;
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
  function move(direction: "l" | "r") {
    return () => {
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
    el.addEventListener("scroll", throttledCheck);
    return () => el.removeEventListener("scroll", throttledCheck);
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
