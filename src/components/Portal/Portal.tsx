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
    setTarget(document.querySelector(`[data-one-portal="${to}"]`) || null);
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
  return (
    <div className={`${Styles.portal} ${className}`} data-one-portal={name} />
  );
}
