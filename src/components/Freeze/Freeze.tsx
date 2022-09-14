import React, { PropsWithChildren, ReactElement, useRef } from "react";
import useFreeze from "../../hooks/useFreeze";

/**
 * Use this component when you would like to freeze some child when this child can assume undefined in the next 'frame'
 **/
export default function Freeze({ children }: PropsWithChildren<{}>) {
  return useFreeze(children) as ReactElement;
}
