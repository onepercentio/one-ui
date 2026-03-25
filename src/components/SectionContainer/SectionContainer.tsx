import React, {
  createRef,
  ForwardedRef,
  forwardRef,
  JSX,
  PropsWithChildren,
  RefObject,
} from "react";
import Styles from "./SectionContainer.module.scss";
import { FromOnePercentUtility } from "../../type-utils";

export function createId(...args: string[]): string {
  return args.join("-");
}

type Props<S extends string> = PropsWithChildren<{
  decoration?: "dark" | "light";
  section?: S;
  className?: string;
  onClick?: JSX.IntrinsicElements["div"]["onClick"];
}>;
function _SectionContainer<S extends string = FromOnePercentUtility<'PageSections'>>(
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
/**
 * A reusable container component that wraps content with consistent styling
 * and optional decorative elements. It helps organize page sections with
 * controlled width and visual enhancements.
 */
const SectionContainer =
  forwardRef<HTMLDivElement, Props<string>>(_SectionContainer);
export default SectionContainer;