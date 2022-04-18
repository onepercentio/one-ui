import FadeIn from "../FadeIn";
import React, {
  HTMLAttributes,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import Styles from "./Collapsable.module.scss";
import { updateTooltipPosition } from "../AnchoredTooltip/AnchoredTooltip";

/**
 * Wrapps some content on a collapsable header
 **/
export default function Collapsable({
  children,
  title,
  className,
  onToggleOpen,
  open,
  id,
  mode = "block",
  contentClassName,
  onContentClick,
  ...props
}: PropsWithChildren<{
  title: React.ReactNode;
  className?: string;
  contentClassName?: string;
  onToggleOpen: (isOpen: boolean) => void;
  open: boolean;
  id?: string | undefined;
  /** This will define if the content will be floating under the title or will expand all the container as one */
  mode?: "block" | "float";
  "data-testid"?: string;
  onContentClick?: HTMLAttributes<HTMLInputElement>["onClick"];
}>) {
  const contentRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = contentRef.current!;
    if (open) {
      el.style.height = el.scrollHeight + "px";
      el.parentElement!.style.position = "relative";
      updateTooltipPosition(el, toggleRef.current!);
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
        el.style.height = 0 + "px";
      }, 100);
      const onTransitionEnd = () => {
        el.parentElement!.style.position = "initial";
        el.removeEventListener("transitionend", onTransitionEnd);
      };
      el.addEventListener("transitionend", onTransitionEnd);
      return () => {
        el.removeEventListener("transitionend", onTransitionEnd);
      };
    }
  }, [open]);

  return (
    <div
      data-testid={props["data-testid"]}
      className={`${Styles.container} ${
        open ? Styles.open : Styles.closed
      } ${className}`}
    >
      <div
        ref={toggleRef}
        onClick={() => onToggleOpen(!open)}
        id={_collapsableId("header", id)}
      >
        {title}
      </div>
      <div
        ref={contentRef}
        className={`${Styles.content} ${
          Styles[mode] || ""
        } ${contentClassName}`}
        id={_collapsableId("content", id)}
        onClick={onContentClick}
      >
        <FadeIn>{open ? children : null}</FadeIn>
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
 * @param id
 * @returns
 */
export function CollapsableInterface(id: string) {
  return new _CollapsableInterface(id);
}
