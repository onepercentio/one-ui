import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import MutableHamburgerButton from "../MutableHamburgerButton";
import Styles from "./AdaptiveSidebar.module.scss";

/**
 * A component that you can put anywhere but hides when small enough and shows the control via a fixed floating button
 **/
export default function AdaptiveSidebar({
  children,
  className = "",
  ...props
}: PropsWithChildren<
  { className?: string } & React.HTMLProps<HTMLDivElement>
>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
          open ? Styles.open : Styles.closed
        } ${className}`}
        {...props}
      >
        {children}
      </div>
      <div className={Styles.hamburger} onClick={() => setOpen((a) => !a)}>
        <MutableHamburgerButton size={48} state={open ? "closed" : "default"} />
      </div>
    </>
  );
}
