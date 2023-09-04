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

type Props<S extends string> =
  PropsWithChildren<{
    decoration?: "dark" | "light";
    section?: S;
    className?: string;
    onClick?: JSX.IntrinsicElements["div"]["onClick"];
  }>;

/**
 * This component wraps a section and limits it's content as well as defining an id to reference this section
 **/
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

const SectionContainer = forwardRef<HTMLDivElement, Props<string>>(_SectionContainer);
export default SectionContainer;
