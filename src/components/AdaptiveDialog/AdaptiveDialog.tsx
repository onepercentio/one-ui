import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import Styles from "./AdaptiveDialog.module.scss";
import MutableHamburgerButton from "../MutableHamburgerButton";
import ScrollAndFocusLock from "../utilitary/ScrollAndFocusLock";
import ReactDOM from "react-dom";

/**
 * This component implements a generic drawer that displays it as a drawer on mobile and as a modal on desktop
 **/
export default function AdaptiveDialog({
  onClose,
  open = false,
  className = "",
  onClickOut,
  children,
}: PropsWithChildren<{
  className?: string;
  open: boolean;
  onClose?: () => void;
  onClickOut?: () => void;
}>) {
  const rootDivRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(open);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      const toggleVisbility = (e: AnimationEvent) => {
        if (e.animationName === Styles.backdropDismiss) {
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

  return isVisible || open ? (
    <>
      {ReactDOM.createPortal(
        <div
          ref={rootDivRef}
          className={`${Styles.backdrop} ${open ? Styles.open : Styles.close} ${
            expanded ? Styles.expanded : ""
          }`}
          onClick={onClickOut}
        >
          <div
            className={`${Styles.container} ${className}`}
            onClick={(e) => e.stopPropagation()}
          >
            <ScrollAndFocusLock open={open}>
              {onClose && (
                <MutableHamburgerButton
                  className={Styles.closeBtn}
                  onClick={onClose}
                  state="closed"
                  size={24}
                />
              )}
              <div
                className={Styles.indicator}
                onClick={() => setExpanded((p) => !p)}
              />
              {children}
            </ScrollAndFocusLock>
          </div>
        </div>,
        document.body
      )}
    </>
  ) : null;
}
