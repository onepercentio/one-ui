import { useMemo, useState } from "react";
import ownEvent from "../../utils/ownEvent";

/**
 * A small hook for binding the hover control over some HTML element
 * @returns uiEvents: The events to spread to the html element hovering: the hover state
 */
export default function useMouseHover() {
  const [hovering, setHovering] = useState(false);
  const uiEvents = useMemo(
    () => ({
      onMouseEnter: ownEvent(() => {
        setHovering(true);
      }),
      onMouseOut: ownEvent(() => {
        setHovering(false);
      }),
    }),
    []
  );

  return {
    uiEvents,
    hovering,
  };
}
