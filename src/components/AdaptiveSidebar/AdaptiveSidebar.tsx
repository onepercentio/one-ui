import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import MutableHamburgerButton from "../MutableHamburgerButton";
import ScrollAndFocusLock from "../utilitary/ScrollAndFocusLock";
import Styles from "./AdaptiveSidebar.module.scss";

const DefaultVisibilityControl = ({ open }: { open: boolean }) => (
  <MutableHamburgerButton size={48} state={open ? "closed" : "default"} />
);

/**
 * A component that you can put anywhere but hides when small enough and shows the control via a fixed floating button
 **/
export default function AdaptiveSidebar({
  children,
  className = "",
  visibilityControlComponent:
    VisibilityControlComponent = DefaultVisibilityControl,
  ...props
}: PropsWithChildren<
  {
    className?: string;
    visibilityControlComponent: (props: {
      open: boolean;
    }) => React.ReactElement;
  } & React.HTMLProps<HTMLDivElement>
>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") return;
    containerRef.current!.scrollTo({
      left: 0,
      behavior: "smooth",
      top: 0,
    });
  }, [open]);

  return (
    <>
      <div
        ref={containerRef}
        className={`${Styles.container} ${
          DefaultVisibilityControl === VisibilityControlComponent
            ? Styles.defaultPadding
            : ""
        } ${open ? Styles.open : Styles.closed} ${className}`}
        {...props}
      >
        <ScrollAndFocusLock open={open}>{children}</ScrollAndFocusLock>
      </div>
      <div className={Styles.hamburger} onClick={() => setOpen((a) => !a)}>
        <VisibilityControlComponent open={open} />
      </div>
    </>
  );
}
