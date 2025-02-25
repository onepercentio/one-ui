import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import Styles from "./AdaptiveDialog.module.scss";
import MutableHamburgerButton from "../MutableHamburgerButton";
import ScrollAndFocusLock from "../utilitary/ScrollAndFocusLock";
import ReactDOM from "react-dom";
import { useOneUIConfig } from "../../context/OneUIProvider";

/**
 * This component implements a generic drawer that displays it as a drawer on mobile and as a modal on desktop
 **/
export default function AdaptiveDialog({
  variant = "default",
  onClose,
  open = false,
  className = "",
  onClickOut,
  children,
  onClosed,
  inline = false,
}: PropsWithChildren<{
  variant?: OnepercentUtility.UIElements.AdaptiveDialogVariants;
  className?: string;
  open: boolean;
  onClose?: () => void;
  onClickOut?: () => void;
  onClosed?: () => void;
  /**
   * Indicates this rendering will write the html inside the current position on dom.
   * If omitted or false, it will render on the document body, to prevent style bleeding */
  inline?: boolean;
}>) {
  const rootDivRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(open);
  const [expanded, setExpanded] = useState(false);
  const variantClass = useOneUIConfig(
    `component.adaptiveDialog.variant.${variant}`,
    ""
  );

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      const toggleVisbility = (e: AnimationEvent) => {
        if (e.animationName === Styles.backdropDismiss) {
          onClosed?.();
          setIsVisible(false);
          (e.target! as HTMLDivElement).removeEventListener(
            "animationend",
            toggleVisbility
          );
        }
      };
      rootDivRef.current!.addEventListener("animationend", toggleVisbility);
    }
  }, [open]);

  const globalClassName = {
    backdrop: useOneUIConfig("component.adaptiveDialog.backdropClassName", ""),
    dialog: useOneUIConfig("component.adaptiveDialog.dialogClassName", ""),
  };
  const content = (
    <div
      ref={rootDivRef}
      className={`${Styles.backdrop} ${open ? Styles.open : Styles.close} ${
        expanded ? Styles.expanded : ""
      } ${globalClassName.backdrop} ${variantClass}`}
      onClick={onClickOut}
      onAnimationEnd={({ target, currentTarget }) => {
        if (target === currentTarget)
          (target as HTMLDivElement).style.pointerEvents = "initial";
      }}
    >
      <div
        className={`${Styles.container} ${className} ${globalClassName.dialog}`}
        onClick={(e) => e.stopPropagation()}
      >
        <ScrollAndFocusLock open={open}>
          {onClose && (
            <button className={Styles.closeBtn} onClick={onClose}>
              <MutableHamburgerButton state="closed" size={24} />
            </button>
          )}
          <div onClick={() => setExpanded((p) => !p)} />
          {children}
        </ScrollAndFocusLock>
      </div>
    </div>
  );

  return isVisible || open ? (
    inline ? (
      content
    ) : (
      <>{ReactDOM.createPortal(content, document.body)}</>
    )
  ) : null;
}
