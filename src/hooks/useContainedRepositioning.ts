import debounce from "lodash/debounce";
import { useEffect, useRef } from "react";

/**
 * This hook takes an html and checks if its outside its parent
 * If it is, it should move it so it can be totally visible inside the container
 */
export default function useContainedRepositioning(
  focused: boolean,
  getParent: (el: HTMLElement) => HTMLElement,
  {
    offset = 16,
    scale = 1,
    offsetLimit = Number.POSITIVE_INFINITY,
  }: {
    /** The offset the element will be moved by from the closest bound */
    offset?: number;

    /** The scaled element width to be considered. usefull for when the focused element will change size */
    scale?: number;

    /** Limit offset */
    offsetLimit?: number;
  } = {}
) {
  const elementToCheck = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = elementToCheck.current;
    if (!el) return;

    const curr = el;
    const relativeParent = getParent(curr);

    if (process.env.NODE_ENV === "development") {
      if (window.getComputedStyle(el).position !== "relative")
        throw new Error(
          "The target element MUST have position relative so it can be moved"
        );
      if (window.getComputedStyle(relativeParent).position !== "relative")
        throw new Error(
          "The relative to element MUST have position relative so it can calculate correctly the target position"
        );
    }

    if (focused) {
      curr.style.right = `0px`;
      const reposition = debounce(() => {
        const alreadyRight = Number(curr.style.right.replace("px", ""));
        const limitOffset =
          relativeParent.scrollLeft + relativeParent.clientWidth;
        const elWidth = curr.clientWidth * scale;
        const offsetOfScale = (elWidth - curr.clientWidth) / 2;
        const cardLimit =
          curr.offsetLeft - offsetOfScale + alreadyRight + elWidth;
        const exceedingSpace = cardLimit - limitOffset;
        const offsetLeft =
          curr.offsetLeft -
          offsetOfScale +
          alreadyRight -
          relativeParent.scrollLeft;
        const isOverflowedRight = exceedingSpace > 0;
        const isOverflowedLeft = offsetLeft < 0;
        const limit = exceedingSpace + -offsetLeft;

        if (isOverflowedRight) {
          const val = Math.min(
            exceedingSpace - -Math.min(Math.abs(limit / 2), offset),
            offsetLimit
          );
          curr.style.right = `${val}px`;
        }
        if (isOverflowedLeft) {
          const val = Math.max(
            offsetLeft - Math.min(Math.abs(limit) / 2, offset),
            -offsetLimit
          );
          curr.style.right = `${val}px`;
        }
        if (isOverflowedLeft || isOverflowedRight) {
          curr.style.zIndex = "1000";
        }
      }, 50);
      reposition();
      reposition.flush();

      relativeParent.addEventListener("scroll", reposition);
      return () => {
        reposition.cancel();
        relativeParent.removeEventListener("scroll", reposition);
        el.style.right = `0px`;
        const restore = ({ propertyName, currentTarget }: TransitionEvent) => {
          const targetTransformation = window.getComputedStyle(
            currentTarget as HTMLDivElement
          ).right;
          if (propertyName === "right" && targetTransformation === "0px") {
            curr.style.zIndex = "";
            el.removeEventListener("transitionend", restore);
          }
        };
        el.addEventListener("transitionend", restore);
      };
    }
  }, [focused]);

  return {
    elementToCheck,
  };
}
