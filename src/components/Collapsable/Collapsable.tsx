import FadeIn from "../FadeIn";
import React, {
  ForwardedRef,
  HTMLAttributes,
  HTMLProps,
  PropsWithChildren,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Styles from "./Collapsable.module.scss";
import {
  AnchoredTooltipAlignment,
  AnchoredTooltipAnchor,
  updateTooltipPosition,
} from "../AnchoredTooltip/AnchoredTooltip";
function _Collapsable(
  {
    children,
    title,
    className,
    onToggleOpen,
    open,
    id,
    mode = "block",
    contentClassName,
    onContentClick,
    keepUnderlayingElement,
    onClickOut,
    ...props
  }: PropsWithChildren<
    {
      title: React.ReactNode;
      className?: string;
      contentClassName?: string;
      onToggleOpen: (isOpen: boolean) => void;
      open: boolean;
      id?: string | undefined;
      "data-testid"?: string;
      onContentClick?: HTMLAttributes<HTMLInputElement>["onClick"];
      /**
       * This flag indicates if the collapsable content should be kept in HTML while it's collapsed
       *
       * Usefull for responsive layouts where the collapsable should not "behave" as a collapsable content
       */
      keepUnderlayingElement?: boolean;

      /**
       * To detect when the user clicks out of the container
       */
      onClickOut?: () => void;
    } & (
      | {
          /** This will define if the content will be floating under the title or will expand all the container as one */
          mode?: "block";
        }
      | {
          mode: "float";
          alignTo: AnchoredTooltipAlignment;
          anchorTo?: AnchoredTooltipAnchor;
        }
    )
  > &
    Omit<HTMLAttributes<HTMLDivElement>, "title">,
  ref: ForwardedRef<{ redimension: () => void }>
) {
  const contentRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && onClickOut) {
      window.addEventListener("click", onClickOut);
      return () => window.removeEventListener("click", onClickOut);
    }
  }, [!!onClickOut, open]);

  function redimension(canShrink: boolean = false) {
    const el = contentRef.current!;
    const contentEl = el.firstElementChild! as HTMLDivElement;
    if (open) {
      el.style.marginTop = ``;
      el.style.height =
        Math.min(
          canShrink ? contentEl.clientHeight : Number.POSITIVE_INFINITY,
          el.scrollHeight,
          visualViewport!.height - 16
        ) + "px";
      el.parentElement!.style.position = "relative";
      if (mode === "float") {
        el.style.minHeight = el.style.height;
        const { shouldAnchorToBottom } = updateTooltipPosition(
          el,
          toggleRef.current!,
          true,
          "alignTo" in props ? props.alignTo : AnchoredTooltipAlignment.CENTER,
          "anchorTo" in props ? props.anchorTo : undefined
        );
        el.style.minHeight = "";
        if (!shouldAnchorToBottom) {
          el.style.marginTop = el.style.height;
        }
        const transitionStart = ({
          currentTarget,
          target,
          propertyName,
        }: TransitionEvent) => {
          if (
            currentTarget === target &&
            propertyName == "height" &&
            !shouldAnchorToBottom
          ) {
            el.classList.add(Styles.transitionMarginTop);
            el.style.marginTop = "0px";
          }
        };
        el.addEventListener("transitionstart", transitionStart);
        return () => el.removeEventListener("transitionstart", transitionStart);
      }
      const onTransitionEnd = () => {
        el.style.height = "auto";
      };
      el.addEventListener("transitionend", onTransitionEnd);
      el.addEventListener("transitionend", () =>
        el.removeEventListener("transitionend", onTransitionEnd)
      );
      return () => {
        el.removeEventListener("transitionend", onTransitionEnd);
      };
    } else {
      el.style.height = el.clientHeight + "px";
      setTimeout(() => {
        if (el.style.marginTop === "0px")
          el.style.marginTop = `${el.clientHeight}px`;
        el.style.height = 0 + "px";
      }, 100);
      const onTransitionEnd = () => {
        el.parentElement!.style.position = "initial";
        el.classList.remove(Styles.transitionMarginTop);
        el.removeEventListener("transitionend", onTransitionEnd);
      };
      el.addEventListener("transitionend", onTransitionEnd);
      return () => {
        el.removeEventListener("transitionend", onTransitionEnd);
      };
    }
  }

  useImperativeHandle(ref, () => ({
    redimension: () => redimension(true),
  }));

  useLayoutEffect(() => {
    redimension();
  }, [open]);

  const propsToSpread = { ...props } as any;
  delete propsToSpread.alignTo;

  return (
    <div
      className={`${Styles.container} ${
        open ? Styles.open : Styles.closed
      } ${className}`}
      {...propsToSpread}
    >
      <div
        ref={toggleRef}
        onClick={(e) => {
          e.stopPropagation();
          onToggleOpen(!open);
        }}
        id={_collapsableId("header", id)}
      >
        {title}
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          if (onContentClick) onContentClick(e as any);
        }}
        ref={contentRef}
        className={`${Styles.content} ${
          Styles[mode] || ""
        } ${contentClassName}`}
        id={_collapsableId("content", id)}
      >
        <FadeIn>{open || keepUnderlayingElement ? children : null}</FadeIn>
      </div>
    </div>
  );
}

function _collapsableId(type: "header" | "content", id?: string) {
  return id ? `collapsable_${type}_${id}` : undefined;
}

class _CollapsableInterface {
  _id: string;

  constructor(id: string) {
    this._id = id;
  }

  _getElements() {
    return {
      header: document.getElementById(_collapsableId("header", this._id)!),
      content: document.getElementById(_collapsableId("content", this._id)!),
    };
  }

  open(onOpened: () => void) {
    const { header, content } = this._getElements();
    if ((content?.clientHeight || 0) === 0) {
      header!.click();
      content!.addEventListener("transitionend", function _handler() {
        content!.removeEventListener("transitionend", _handler);
        onOpened();
      });
    } else {
      onOpened();
    }
  }

  getElement(type: "header" | "content"): HTMLDivElement | null {
    return document.getElementById(
      _collapsableId(type, this._id)!
    ) as HTMLDivElement | null;
  }
}

/**
 * A helper function for interacting with collapsables without a reference
 */
export function CollapsableInterface(id: string) {
  return new _CollapsableInterface(id);
}

/**
 * Allows collapsing and expanding the wrapped content
 **/
const Collapsable = forwardRef(_Collapsable);
export default Collapsable;
