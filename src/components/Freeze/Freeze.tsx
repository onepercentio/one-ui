import React, { PropsWithChildren, useRef } from "react";

/**
 * Use this component when you would like to freeze some child when this child can assume undefined in the next 'frame'
 **/
export default function Freeze({ children }: PropsWithChildren<{}>) {
  const currChildOrPrev = useRef<any>();
  currChildOrPrev.current = children || currChildOrPrev.current;
  return currChildOrPrev.current || null;
}
