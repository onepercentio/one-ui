import ReactDOM from "react-dom";
import React, { PropsWithChildren, useMemo } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import Styles from "./Portal.module.scss";

/**
 * A react portal implementation with current page fallback
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
    <>{target === null ? children : ReactDOM.createPortal(children, target)}</>
  );
}

export function PortalReceiver({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const timestamp = useMemo(() => Date.now(), []);
  return (
    <div
      className={`${Styles.portal} ${className}`}
      data-one-portal={name}
      ref={ref}
      data-timestamp={timestamp}
    />
  );
}
