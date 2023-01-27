import { useMemo, useState } from "react";

/**
 * A small hook for binding the hover control over some HTML element
 * @returns uiEvents: The events to spread to the html element hovering: the hover state
 */
export default function useMouseHover() {
  const [hovering, setHovering] = useState(false);
  const uiEvents = useMemo(
    () => ({
      onMouseEnter: () => {
        setHovering(true);
      },
      onMouseOut: () => {
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
