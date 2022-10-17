import throttle from "lodash/throttle";
import { useEffect, useState } from "react";

/**
 * A hook to trigger changes when the screen resizes
 * @returns If the current resolution is lower than the specified width
 */
export default function useBreakpoint(breakInto: number) {
  const [lowerThanBreakpoint, setIsLowerThanBreakpoint] = useState(
    () => window.visualViewport!.width < breakInto
  );
  useEffect(() => {
    const onResizeThrottle = throttle(() => {
      setIsLowerThanBreakpoint(window.visualViewport!.width < breakInto);
    }, 1000 / 4);
    const onResize = () => onResizeThrottle();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return lowerThanBreakpoint;
}
