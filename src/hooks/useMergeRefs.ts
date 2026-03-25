import { RefObject, useLayoutEffect, useRef } from "react";

/**
 * This hook combines multiple refs into one so they all point to the same element
 */
// Combines multiple refs to work together
export default function useMergeRefs<T extends ReturnType<typeof useRef>>(
  mainRef: T,
  ...otherRefs: (T | undefined)[]
) {
  useLayoutEffect(() => {
    for (let ref of otherRefs.filter(Boolean)) ref!.current = mainRef.current;
  }, []);
  return mainRef;
}

/**
 * This function exists so we can work with multiple refs as a single one, almost immediatly
 */
// Creates a function to set all refs at once
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
