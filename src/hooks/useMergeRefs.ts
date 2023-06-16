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

/**
 * This function exists so we can work with multiple refs as a single one, almost immediatly
 */
export function useMergeRefsFunc<
  T extends ReturnType<typeof useRef> | ((ref: any) => void)
>(mainRef: T, ...otherRefs: T[]) {
  return (providedRef: any) => {
    if (providedRef)
      for (let ref of [mainRef, ...otherRefs]) {
        if (typeof ref === "function") ref(providedRef);
        else ref.current = providedRef;
      }
  };
}
