import { useMemo, useState } from "react";

/**
 * A small hook for binding the hover control over some HTML element
 * @returns uiEvents: The events to spread to the html element hovering: the hover state
 */
export default function useMouseHover() {
  const [hovering, setHovering] = useState(false);
  // enter/leave (not over/out) so the state tracks the bound element as a whole
  // and isn't toggled by the pointer moving across its children.
  const uiEvents = useMemo(
    () => ({
      onMouseEnter: () => {
        setHovering(true);
      },
      onMouseLeave: () => {
        setHovering(false);
      },
    }),
    []
  );

  return {
    uiEvents,
    hovering,
  };
}
