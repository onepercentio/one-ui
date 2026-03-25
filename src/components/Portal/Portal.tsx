import ReactDOM from "react-dom";
import React, {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
  useMemo,
} from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import Styles from "./Portal.module.scss";

/**
 * A react portal implementation with current page fallback
 *
 * Usage
 * <PortalReceiver name="receive"/>
 *
 * <Portal to="receive">CHILD</Portal>
 *
 * This component renders its children inside a different part of the DOM tree
 * than where it was originally placed, allowing content to appear outside its
 * parent containers (useful for modals, tooltips, and dropdowns).
 **/
export default function Portal({
  to,
  children,
}: PropsWithChildren<{ to: string }>) {
  const [target, setTarget] = useState<Element | null>();

  useEffect(() => {
    const els = document.querySelectorAll(`[data-one-portal="${to}"]`);
    let latestEl: any;
    els.forEach((el: any) => {
      latestEl =
        Number(el.getAttribute("data-timestamp")) >
          Number(latestEl?.timestamp || 0)
          ? el
          : latestEl;
    });
    setTarget(latestEl || null);
  }, []);

  return target === undefined ? null : (
    <>{target === null ? children : ReactDOM.createPortal(children as any, target)}</>
  );
}

function _PortalReceiver(
  {
    name,
    className = "",
    ...props
  }: {
    name: string;
    className?: string;
  } & Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    "ref"
  >,
  _ref: ForwardedRef<HTMLDivElement>
) {
  const timestamp = useMemo(() => Date.now(), []);
  return (
    <div
      className={`${Styles.portal} ${className}`}
      data-one-portal={name}
      ref={_ref}
      data-timestamp={timestamp}
      {...props}
    />
  );
}

export const PortalReceiver = forwardRef(_PortalReceiver);
