import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  PropsWithChildren,
  useLayoutEffect,
  useRef,
} from "react";
import Styles from "./StaticScroller.module.scss";
import { debounce, throttle } from "lodash";

/**
 * Mantains a static content at the start of the container and when scrolled animates it's concealment
 **/
export default function StaticScroller({
  children,
  ...props
}: PropsWithChildren<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = rootRef.current!;
    let latestScroll: number | undefined;
    const child = el.children[0] as HTMLDivElement;

    const checkIfNeedsToHide = debounce(() => {
      const direction = el.scrollLeft > latestScroll! ? "in" : "out";
      if (el.scrollLeft < child.clientWidth) {
        el.scrollTo({
          left: direction === "in" ? child.clientWidth : 0,
          behavior: "smooth",
        });
      }
      latestScroll = undefined;
    }, 500);
    const throtleSetLast = throttle(
      (last: number) => {
        latestScroll = last;
      },
      1000 / 5,
      {
        leading: true,
        trailing: false,
      }
    );
    const onScroll = () => {
      const min = Math.min(el.scrollLeft, child.clientWidth);
      const opacity = String(1 - min / child.clientWidth);
      child.style.opacity = opacity;
      checkIfNeedsToHide();
      throtleSetLast(el.scrollLeft);
    };
    el.addEventListener("scroll", onScroll);

    return () => {
      el.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className={Styles.root} {...props} ref={rootRef}>
      {children}
    </div>
  );
}
