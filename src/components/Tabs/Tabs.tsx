import React, { ReactElement, useEffect, useRef } from "react";
import Styles from "./Tabs.module.scss";

export enum TabType {
  FULL,
  UNDERLINE,
}

/**
 * Show tabs for toggling between options
 **/
export default function Tabs<O extends string | number>({
  options,
  selected,
  onSelect,
  itemClassName = "",
  className = "",
  type = TabType.UNDERLINE,
}: {
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
  type?: TabType;
}) {
  const selectedRef = useRef<HTMLParagraphElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
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
    guideRef.current!.classList.add(Styles.enableTransition);
  }, []);
  return (
    <>
      <div
        className={`${Styles.container} ${className} ${Styles[TabType[type]]}`}
      >
        {options.map((o) => (
          <p
            ref={selected === o.id ? selectedRef : undefined}
            onClick={() => onSelect(o.id)}
            className={`${
              selected === o.id ? Styles.selected : ""
            } ${itemClassName}`}
            key={o.id}
            data-testid="tab-option"
          >
            {o.label}
          </p>
        ))}
        <div ref={guideRef} className={Styles.guide} data-testid="tab-guide" />
      </div>
    </>
  );
}
