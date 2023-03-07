import React, {
  ForwardedRef,
  forwardRef,
  ReactNode,
  RefObject,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import FadeIn from "../FadeIn";
import Styles from "./AnchoredTooltip.module.scss";
import ReactDOM from "react-dom";
import useFreeze from "../../hooks/useFreeze";

type Props = {
  children: JSX.Element;
  anchorRef: RefObject<HTMLElement>;
  open: boolean;
  className?: string;
  /**
   * Indicates the tooltip should be always visible on viewport
   *
   * @default true
   */
  containInViewport?: boolean;

  style?: any;
};

function getPositionOnViewport(element: HTMLElement) {
  return element.getBoundingClientRect();
}

export enum AnchoredTooltipAlignment {
  LEFT,
  CENTER,
  RIGHT,
}

function calculateTooltipFromAnchor(
  anchorRef: HTMLElement,
  tooltipRef: HTMLDivElement,
  containInViewport: boolean,
  alignTo: AnchoredTooltipAlignment = AnchoredTooltipAlignment.CENTER
) {
  const anchorPosition = getPositionOnViewport(anchorRef);

  const shouldAnchorToBottom = tooltipRef.clientHeight > anchorPosition.top;

  let top = anchorPosition.top - tooltipRef.clientHeight;

  /**
   * The terms mean:
   * anchorPosition.left    = The left to get to the left border of the anchor (visible element)
   * anchorPosition.width   = The width of the anchor (visible element)
   * tooltipRef.clientWidth = The width of the content
   */
  let left = (() => {
    switch (alignTo) {
      case AnchoredTooltipAlignment.CENTER:
        return (
          anchorPosition.left +
          anchorPosition.width / 2 -
          tooltipRef.clientWidth / 2
        );
      case AnchoredTooltipAlignment.LEFT:
        return anchorPosition.left;
      case AnchoredTooltipAlignment.RIGHT:
        return (
          anchorPosition.left + anchorPosition.width - tooltipRef.clientWidth
        );
    }
  })();

  if (shouldAnchorToBottom)
    top += tooltipRef.clientHeight + anchorRef.clientHeight;

  if (containInViewport && top < 0) top = 0;
  const offset = top + tooltipRef.clientHeight - window.innerHeight;
  if (containInViewport && offset > 0) {
    top -= offset;
  }
  const offsetLeft = left + tooltipRef.clientWidth - window.innerWidth;
  if (containInViewport && offsetLeft > 0) {
    left -= offsetLeft;
  }
  if (containInViewport && left < 0) {
    left = 0;
  }

  const maxLeftOffsetIndicator = tooltipRef.clientWidth / 2 - 60;
  const tooltipCenter = tooltipRef.clientWidth / 2 + left;
  const anchorPositionCenter = anchorPosition.left + anchorPosition.width / 2;

  const offsetTooltip = anchorPositionCenter - tooltipCenter;
  const minOffsetTooltip = -(tooltipRef.clientWidth / 2) + 60;

  const offsetIndicatorLeft =
    offsetLeft > 0
      ? offsetLeft > maxLeftOffsetIndicator
        ? maxLeftOffsetIndicator
        : offsetLeft
      : offsetTooltip < 0
      ? offsetTooltip < minOffsetTooltip
        ? minOffsetTooltip
        : offsetTooltip
      : 0;

  return {
    offset,
    offsetIndicatorLeft,
    top,
    left,
    shouldAnchorToBottom,
  };
}

export function updateTooltipPosition(
  tooltipRef: HTMLDivElement,
  anchorRef: HTMLElement,
  limitToViewport: boolean = true,
  alignment: AnchoredTooltipAlignment = AnchoredTooltipAlignment.CENTER
) {
  const { top, left, shouldAnchorToBottom, offsetIndicatorLeft } =
    calculateTooltipFromAnchor(
      anchorRef,
      tooltipRef,
      limitToViewport,
      alignment
    );
  if (limitToViewport) {
    const maxHeight = window.innerHeight - top;
    tooltipRef.style.maxHeight = `${maxHeight - 32}px`;
  }
  tooltipRef.style.top = `${top}px`;
  tooltipRef.style.left = `${left}px`;
  tooltipRef.style.setProperty(
    "--anchor-indicator-offset-left",
    `${offsetIndicatorLeft}px`
  );
  if (shouldAnchorToBottom) {
    tooltipRef.classList.remove(Styles.anchoredTop);
    tooltipRef.classList.add(Styles.anchoredBottom);
  } else {
    tooltipRef.classList.add(Styles.anchoredTop);
    tooltipRef.classList.remove(Styles.anchoredBottom);
  }

  return { shouldAnchorToBottom };
}

/**
 * This tooltip anchors itself to an element and handles positioning relative to the anchored element
 **/
function AnchoredTooltip(
  { containInViewport = true, ...props }: Props,
  ref: ForwardedRef<{ updatePosition: () => void }>
) {
  const { open, children, anchorRef } = props;
  const tooltipRef = useRef<HTMLDivElement>(null);
  const className = useOneUIConfig("component.tooltip.className");

  useImperativeHandle(
    ref,
    () => ({
      updatePosition: () => {
        updateTooltipPosition(
          tooltipRef.current!,
          anchorRef.current!,
          containInViewport
        );
      },
    }),
    [containInViewport]
  );

  useEffect(() => {
    if (open) {
      if (anchorRef.current && tooltipRef.current)
        updateTooltipPosition(
          tooltipRef.current,
          anchorRef.current,
          containInViewport
        );
      const scrollHandler = () => {
        if (anchorRef.current && tooltipRef.current)
          updateTooltipPosition(
            tooltipRef.current,
            anchorRef.current,
            containInViewport
          );
      };
      window.addEventListener("scroll", scrollHandler);
      return () => {
        window.removeEventListener("scroll", scrollHandler);
      };
    }
  }, [open, anchorRef]);

  const openedSomeTime = useFreeze(open);

  return openedSomeTime ? (
    <>
      {ReactDOM.createPortal(
        <FadeIn
          onClick={(e) => e.stopPropagation()}
          ref={tooltipRef}
          className={`${Styles.tooltipContainer} ${open ? Styles.open : ""} ${
            props.className || ""
          } ${className}`}
          style={props.style}
        >
          {open ? <div>{children}</div> : undefined}
        </FadeIn>,
        document.body
      )}
    </>
  ) : null;
}

export default forwardRef(AnchoredTooltip);
