import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import Styles from "./AdaptiveDialog.module.scss";
import HeaderCloseBtn from "../HeaderCloseBtn";

/**
 * This component implements a generic drawer that displays it as a drawer on mobile and as a modal on desktop
 **/
export default function AdaptiveDialog({
  onClose,
  open = false,
  className = "",
  children,
}: PropsWithChildren<{
  className?: string;
  open: boolean;
  onClose?: () => void;
}>) {
  const rootDivRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(open);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (open) {
      startOfModal.current!.focus()
      document.body.style.overflow = "hidden";
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

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const firstAnchor = useRef<HTMLDivElement>(null);
  const lastAnchor = useRef<HTMLDivElement>(null);
  const startOfModal = useRef<HTMLDivElement>(null);

  function onFocusAnchors(e: React.FocusEvent<HTMLDivElement>) {
    const focusOnStartOfModal = () => {
      const nextSibling = firstAnchor.current!.nextElementSibling;
      if (nextSibling instanceof HTMLDivElement) nextSibling.focus();
    };
    if (e.target === firstAnchor.current) {
      if (e.relatedTarget === startOfModal.current) lastAnchor.current!.focus();
      else focusOnStartOfModal();
    } else if (
      e.target === lastAnchor.current &&
      e.relatedTarget !== firstAnchor.current
    ) {
      focusOnStartOfModal();
    }
  }
  useEffect(() => {
    if (open) startOfModal.current!.focus();
  }, []);

  return isVisible || open ? (
    <div
      ref={rootDivRef}
      className={`${Styles.backdrop} ${open ? Styles.open : Styles.close} ${
        expanded ? Styles.expanded : ""
      }`}
    >
      <div className={`${Styles.container} ${className}`}>
        <div ref={firstAnchor} tabIndex={0} onFocus={onFocusAnchors} />
        <div ref={startOfModal} tabIndex={0} />
        {onClose && (
          <HeaderCloseBtn mode="close" hidden={false} onClick={onClose} />
        )}
        <div
          className={Styles.indicator}
          onClick={() => setExpanded((p) => !p)}
        />
        {children}
        <div ref={lastAnchor} tabIndex={0} onFocus={onFocusAnchors} />
      </div>
    </div>
  ) : null;
}
