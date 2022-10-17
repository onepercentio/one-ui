import { RefObject, useLayoutEffect, useRef } from "react";

/**
 * This function exists so we can work with multiple refs as a single one
 */
export default function useMergeRefs<T extends ReturnType<typeof useRef>>(
  mainRef: T,
  ...otherRefs: T[]
) {
  useLayoutEffect(() => {
    for (let ref of otherRefs) ref.current = mainRef.current;
  }, []);
  return mainRef;
}
