import React, { useEffect, useRef } from "react";
import Styles from "./Tabs.module.scss";

/**
 * Show tabs for toggling between options
 **/
export default function Tabs<O extends string>({
  options,
  selected,
  onSelect,
  itemClassName = "",
}: {
  options: Readonly<
    {
      id: O;
      label: string;
    }[]
  >;
  selected?: O;
  onSelect: (option: O) => void;
  itemClassName?: string;
}) {
  const selectedRef = useRef<HTMLParagraphElement>(null);
  const guideRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    guideRef.current!.style["opacity"] = selectedRef.current
      ? "1"
      : guideRef.current!.style["opacity"];
    guideRef.current!.style["width"] = selectedRef.current
      ? selectedRef.current.clientWidth + "px"
      : "0px";
    guideRef.current!.style["left"] = selectedRef.current
      ? selectedRef.current.offsetLeft + "px"
      : guideRef.current!.style["left"] || "initial";
    guideRef.current!.style["top"] = selectedRef.current
      ? selectedRef.current.offsetTop + selectedRef.current.clientHeight + "px"
      : guideRef.current!.style["top"] || "initial";
  }, [selected]);
  return (
    <>
      <div className={Styles.container}>
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
