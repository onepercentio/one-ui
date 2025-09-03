import { useRef } from "react";

/**
 * This hook pipes a data and when it is set to a falsy value ("", undefined, null, 0),
 * it returns the previous valid value
 */
export default function useFreeze<T>(something: T) {
  const currChildOrPrev = useRef<T>(undefined);
  currChildOrPrev.current =
    something === undefined ? currChildOrPrev.current : something;
  return currChildOrPrev.current || something;
}
