import React, { PropsWithChildren, useEffect, useRef } from "react";

/**
 * This utilitary component shall be used to lock the focus and disable scroll over the wrapped component
 **/
export default function ScrollAndFocusLock({
  open,
  children,
}: PropsWithChildren<{
  open: boolean;
}>) {
  const firstAnchor = useRef<HTMLDivElement>(null);
  const lastAnchor = useRef<HTMLDivElement>(null);
  const startOfModal = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) startOfModal.current!.focus();
  }, []);
  useEffect(() => {
    if (open) {
      startOfModal.current!.focus();
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

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
  return (
    <>
      <div ref={firstAnchor} tabIndex={0} onFocus={onFocusAnchors} />
      <div ref={startOfModal} tabIndex={0} />
      {children}
      <div ref={lastAnchor} tabIndex={0} onFocus={onFocusAnchors} />
    </>
  );
}
