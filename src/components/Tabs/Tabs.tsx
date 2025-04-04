import React, { ReactElement, useEffect, useRef } from "react";
import Styles from "./Tabs.module.scss";

export enum TabType {
  /** A div that encovers the tab */
  FULL,
  /** An underline */
  UNDERLINE,
  /** A class is assigned to the selected tab */
  CLASS,
}

/**
 * Show tabs for toggling between options
 **/
export default function Tabs<O extends string | number>(
  props: {
    options: Readonly<
      {
        id: O;
        label: string | ReactElement;
      }[]
    >;
    selected?: O;
    onSelect: (option: O) => void;
    itemClassName?: string;
    className?: string;
  } & (
    | {
        type?: Exclude<TabType, TabType.CLASS>;
      }
    | {
        type?: Extract<TabType, TabType.CLASS>;
        selectedClass: string;
      }
  )
) {
  const {
    options,
    selected,
    onSelect,
    itemClassName = "",
    className = "",
    type = TabType.UNDERLINE,
  } = props;
  const selectedRef = useRef<HTMLParagraphElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (props.type === TabType.CLASS) return;
    const guideStyle = guideRef.current!.style;
    const currEl = selectedRef.current;
    guideStyle["opacity"] = currEl ? "1" : guideStyle["opacity"];
    guideStyle["width"] = currEl ? currEl.clientWidth + "px" : "0px";
    guideStyle["left"] = currEl
      ? currEl.offsetLeft + "px"
      : guideStyle["left"] || "initial";
    if (type === TabType.FULL) {
      guideStyle["height"] = currEl ? currEl.clientHeight + "px" : "";
      guideStyle["top"] = currEl
        ? currEl.offsetTop + "px"
        : guideStyle["top"] || "initial";
    } else {
      guideStyle["top"] = currEl
        ? currEl.offsetTop + currEl.clientHeight + "px"
        : guideStyle["top"] || "initial";
    }
  }, [selected]);

  useEffect(() => {
    if (props.type === TabType.CLASS) return;
    guideRef.current!.classList.add(Styles.enableTransition);
  }, []);
  const tabNativeCls = TabType[type] in Styles ? Styles[TabType[type]] : "";
  return (
    <>
      <div className={`${Styles.container} ${className} ${tabNativeCls}`}>
        {options.map((o) => (
          <p
            ref={selected === o.id ? selectedRef : undefined}
            onClick={() => onSelect(o.id)}
            className={`${
              selected === o.id ? Styles.selected : ""
            } ${itemClassName} ${
              props.type === TabType.CLASS && selected === o.id
                ? props.selectedClass
                : ""
            }`}
            key={o.id}
            data-testid="tab-option"
          >
            {o.label}
          </p>
        ))}
        {TabType.CLASS !== props.type && (
          <div
            ref={guideRef}
            className={Styles.guide}
            data-testid="tab-guide"
          />
        )}
      </div>
    </>
  );
}
