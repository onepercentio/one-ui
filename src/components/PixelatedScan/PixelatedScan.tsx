import React, { useEffect, useMemo, useRef, useState } from "react";
import Styles from "./PixelatedScan.module.scss";
import chromajs from "chroma-js";

const AnimDuration = Number(Styles.animationDuration);

/**
 * This effect scans up and down on the div with a following pixelated trail
 **/
export default function PixelatedScan({
  squaresByLine,
  color,
  className = "",
}: {
  squaresByLine: number;
  color: string;
  className?: string;
}) {
  const iteration = useRef(0);
  const tableRef = useRef<HTMLTableElement>(null);
  const [config, setConfig] =
    useState<{ squareSize: number; howMuchLines: number }>();

  useEffect(() => {
    const squareSize = tableRef.current!.clientWidth / squaresByLine;
    const howMuchLines = tableRef.current!.clientHeight / squareSize;

    setConfig({
      squareSize,
      howMuchLines,
    });
  }, []);
  const rowsDef = useMemo(() => {
    return new Array(Math.ceil(config?.howMuchLines || 0)).fill(undefined);
  }, [config]);
  const lineDef = useMemo(() => {
    return new Array(squaresByLine).fill(undefined);
  }, [config]);
  return (
    <>
      <div
        className={`${Styles.grid} ${Styles.iterate} ${className}`}
        ref={tableRef}
      >
        {rowsDef.map((_, iRow, _rows) => (
          <div key={`${iRow}`}>
            {lineDef.map((_, iColumn, _columns) => {
              return (
                <GridItem
                  key={`${iRow}-${iColumn}`}
                  baseColor={color}
                  size={config!.squareSize}
                  lineCount={config!.howMuchLines}
                  lineIndex={iRow}
                  onFinish={
                    iRow === _rows.length - 6 && iColumn === _columns.length - 1
                      ? () => {
                          tableRef.current!.classList.remove(Styles.iterate);
                          iteration.current += 1;
                          if (iteration.current % 2 === 1)
                            tableRef.current!.classList.add(Styles.inverse);
                          else
                            tableRef.current!.classList.remove(Styles.inverse);
                          setTimeout(() => {
                            tableRef.current!.classList.add(Styles.iterate);
                          }, 100);
                        }
                      : undefined
                  }
                />
              );
            })}
          </div>
        ))}
        <div className={Styles.guide} />
      </div>
    </>
  );
}

function GridItem({
  size,
  lineCount,
  lineIndex,
  baseColor = "#ff0",
  onFinish,
}: {
  size: number;
  lineCount: number;
  lineIndex: number;
  baseColor?: string;
  onFinish?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  function calculateNewRandomColorStrength() {
    const color = chromajs.hex(baseColor).alpha(1 - Math.random() * 0.3);
    return color;
  }
  const [randomColorStrength, setRandomColorStrength] =
    useState<chromajs.Color>(calculateNewRandomColorStrength);

  useEffect(() => {
    function updateColor() {
      setRandomColorStrength(calculateNewRandomColorStrength());
    }
    ref.current?.addEventListener("animationend", updateColor);

    return () => {
      ref.current?.removeEventListener("animationend", updateColor);
    };
  }, []);
  return (
    <div
      ref={ref}
      className={Styles.gridAnimate}
      onAnimationEnd={onFinish}
      style={{
        width: size,
        height: size,
        animationDelay: `${(AnimDuration / lineCount) * (lineIndex - 1)}ms`,
        ...({ "--pixel-color": randomColorStrength.hex() } as any),
      }}
    />
  );
}
