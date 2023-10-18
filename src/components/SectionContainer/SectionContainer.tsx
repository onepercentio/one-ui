import React, {
  createRef,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  RefObject,
} from "react";
import Styles from "./SectionContainer.module.scss";

export function createId(...args: string[]): string {
  return args.join("-");
}

type Props<S extends string> = PropsWithChildren<{
  decoration?: "dark" | "light";
  section?: S;
  className?: string;
  onClick?: JSX.IntrinsicElements["div"]["onClick"];
}>;
function _SectionContainer<S extends string = OnepercentUtility.PageSections>(
  { children, section, className = "", decoration, onClick }: Props<S>,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      className={`${Styles.root} ${className}`}
      id={section}
    >
      <div
        className={`${Styles.content} ${decoration ? Styles.decorated : ""}`}
      >
        {children}
        {decoration && (
          <div className={`${Styles.decoration} ${Styles[decoration]}`} />
        )}
      </div>
    </div>
  );
}

/**
 * This component wraps a section and limits the width of it's content as well as requiring an id to reference to this section
 **/
const SectionContainer =
  forwardRef<HTMLDivElement, Props<string>>(_SectionContainer);
export default SectionContainer;
