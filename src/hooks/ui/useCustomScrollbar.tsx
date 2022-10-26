import { useEffect, useLayoutEffect, useRef } from "react";
import Styles from "./useCustomScrollbar.module.scss";

export default function useCustomScrollBar({
  color = "",
  propagate = false
}: { color?: string, propagate?: boolean } | undefined = {}) {
  const elRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    console.log(elRef.current);
    elRef.current!.style.setProperty("--scrollbar-color", color);
    elRef.current!.classList.add(Styles.scrollBarRoot);
    if (propagate) {
        elRef.current!.classList.add(Styles.propagate);
    }
  }, []);

  return {
    /** The element that dhould have a custom scrollbar */
    elRef,
  };
}
