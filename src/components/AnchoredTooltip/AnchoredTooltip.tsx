import React, {
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import FadeIn from "../FadeIn";
import Styles from "./AnchoredTooltip.module.scss";

type Props = {
  children: JSX.Element;
  anchorRef: RefObject<HTMLElement>;
  open: boolean;
  className?: string;
};

function getPositionOnViewport(element: HTMLElement) {
  return element.getBoundingClientRect();
}

function calculateTooltipFromAnchor(
  anchorRef: RefObject<HTMLElement>,
  tooltipRef: RefObject<HTMLDivElement>
) {
  const anchorPosition = getPositionOnViewport(anchorRef.current!);

  const shouldAnchorToBottom =
    tooltipRef.current!.clientHeight > anchorPosition.top;

  let top = anchorPosition.top - tooltipRef.current!.clientHeight;

  let left =
    anchorPosition.left +
    anchorPosition.width / 2 -
    tooltipRef.current!.clientWidth / 2;

  if (shouldAnchorToBottom)
    top += tooltipRef.current!.clientHeight + anchorRef.current!.clientHeight;

  if (top < 0) top = 0;
  const offset = top + tooltipRef.current!.clientHeight - window.innerHeight;
  if (offset > 0) {
    top -= offset;
  }
  const offsetLeft = left + tooltipRef.current!.clientWidth - window.innerWidth;
  if (offsetLeft > 0) {
    left -= offsetLeft;
  }
  if (left < 0) {
    left = 0;
  }

  const maxLeftOffsetIndicator = tooltipRef.current!.clientWidth / 2 - 60;
  const tooltipCenter = tooltipRef.current!.clientWidth / 2 + left;
  const anchorPositionCenter = anchorPosition.left + anchorPosition.width / 2;

  const offsetTooltip = anchorPositionCenter - tooltipCenter;
  const minOffsetTooltip = -(tooltipRef.current!.clientWidth / 2) + 60;

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

/**
 * This tooltip anchors itself to an element and handles positioning relative to the anchored element
 **/
export default function AnchoredTooltip(props: Props) {
  const { open, children, anchorRef } = props;
  const tooltipRef = useRef<HTMLDivElement>(null);

  function updateTooltipPosition() {
    if (!anchorRef.current) return;
    const { top, left, shouldAnchorToBottom, offsetIndicatorLeft } =
      calculateTooltipFromAnchor(anchorRef, tooltipRef);
    tooltipRef.current!.style.top = `${top}px`;
    tooltipRef.current!.style.left = `${left}px`;
    tooltipRef.current!.style.setProperty(
      "--anchor-indicator-offset-left",
      `${offsetIndicatorLeft}px`
    );
    if (shouldAnchorToBottom) {
      tooltipRef.current!.classList.remove(Styles.anchoredTop);
      tooltipRef.current!.classList.add(Styles.anchoredBottom);
    } else {
      tooltipRef.current!.classList.add(Styles.anchoredTop);
      tooltipRef.current!.classList.remove(Styles.anchoredBottom);
    }
  }

  useEffect(() => {
    if (open) {
      updateTooltipPosition();
      const scrollHandler = () => {
        updateTooltipPosition();
      };
      window.addEventListener("scroll", scrollHandler);
      return () => {
        window.removeEventListener("scroll", scrollHandler);
      };
    }
  }, [open, anchorRef]);

  return (
    <>
      <FadeIn
        onClick={(e) => e.stopPropagation()}
        ref={tooltipRef}
        className={`${Styles.tooltipContainer} ${open ? Styles.open : ""} ${
          props.className || ""
        }`}
      >
        {open ? <div>{children}</div> : undefined}
      </FadeIn>
      {/* {process.env.NODE_ENV === "development" && open ? (
        <DebuggingHelper tooltipRef={tooltipRef} {...props} />
      ) : null} */}
    </>
  );
}

function DebuggingHelper(
  props: Props & { tooltipRef: RefObject<HTMLDivElement> }
) {
  const [anchorInfo, setAnchorInfo] = useState({});

  function update() {
    return getPositionOnViewport(props.anchorRef.current!).toJSON();
  }
  useEffect(() => {
    setAnchorInfo(update());
    setInterval(() => {
      setAnchorInfo(update());
    }, 500);
  }, []);
  return (
    <div
      style={{
        backgroundColor: "black",
        position: "fixed",
        color: "green",
        fontFamily: "monospace",
        padding: "1em",
        fontSize: "16px",
        lineHeight: "1.5em",
        opacity: 0.75,
        bottom: 0,
        right: 0,
        maxHeight: "50vh",
        overflow: "auto",
        pointerEvents: "none",
      }}
    >
      Calculated info:
      <br />
      {Object.entries(
        calculateTooltipFromAnchor(props.anchorRef, props.tooltipRef)
      ).map(([k, v]) => {
        return (
          <p>
            <b>{k}</b>: {typeof v !== "boolean" ? v : v ? "true" : "false"}
          </p>
        );
      })}
      Window info:
      <br />
      <p>
        <b>Height:</b> {window.innerHeight}
      </p>
      <br />
      Anchor info:
      {Object.entries(anchorInfo).map(([name, value]) => {
        return (
          <p>
            <b>{name}</b>: {value as string}
          </p>
        );
      })}
    </div>
  );
}
