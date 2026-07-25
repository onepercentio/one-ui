import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import Styles from "./AdaptiveDialog.module.scss";
import MutableHamburgerButton from "../MutableHamburgerButton";
import ScrollAndFocusLock from "../utilitary/ScrollAndFocusLock";
import { useOneUIConfig } from "../../context/OneUIProvider";
import { FromOnePercentUtility } from "../../type-utils";

/**
 * This is a dialog component that shows content in an overlay. 
 * On mobile devices, it slides in from the side like a drawer menu,
 * while on desktop computers, it appears as a centered popup window.
 * It handles closing animations and can render in different locations on the page.
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
  variant?: FromOnePercentUtility<'UIElements.AdaptiveDialogVariants'>;
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
  const CloseButtonComponent = useOneUIConfig(
    "component.adaptiveDialog.closeButton.Component"
  );
  const content = (
    <div
      ref={rootDivRef}
      className={`${Styles.backdrop} ${open ? Styles.open : Styles.close} ${expanded ? Styles.expanded : ""
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
          {onClose &&
            (CloseButtonComponent ? (
              <CloseButtonComponent onClick={onClose} />
            ) : (
              <button className={Styles.closeBtn} onClick={onClose}>
                <MutableHamburgerButton state="closed" size={24} />
              </button>
            ))}
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