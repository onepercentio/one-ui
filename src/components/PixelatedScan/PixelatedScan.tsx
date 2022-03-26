import React, {
  ElementRef,
  ForwardedRef,
  forwardRef,
  RefObject,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
          <GridRow
            key={`${iRow}`}
            squares={lineDef}
            size={config!.squareSize}
            baseColor={color}
            lineCount={config!.howMuchLines}
            lineIndex={iRow}
            onFinish={
              iRow === _rows.length - 6
                ? () => {
                    tableRef.current!.classList.remove(Styles.iterate);
                    iteration.current += 1;
                    if (iteration.current % 2 === 1)
                      tableRef.current!.classList.add(Styles.inverse);
                    else tableRef.current!.classList.remove(Styles.inverse);
                    setTimeout(() => {
                      tableRef.current!.classList.add(Styles.iterate);
                    }, 100);
                  }
                : undefined
            }
          />
        ))}
        <div className={Styles.guide} />
      </div>
    </>
  );
}

function GridRow({
  onFinish,
  squares,
  size,
  baseColor,
  lineCount,
  lineIndex,
}: {
  squares: Array<any>;
  onFinish?: () => void;
  size: number;
  baseColor?: string;
  lineCount: number;
  lineIndex: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gridItemsRefs = useRef<(ElementRef<typeof GridItem> | null)[]>([]);

  useEffect(() => {
    function updateColor() {
      gridItemsRefs.current.forEach((i) => i?.updateColor());
    }
    ref.current?.addEventListener("animationend", updateColor);

    return () => {
      ref.current?.removeEventListener("animationend", updateColor);
    };
  }, []);
  return (
    <div
      className={Styles.gridAnimate}
      onAnimationEnd={onFinish}
      style={{
        animationDelay: `${(AnimDuration / lineCount) * (lineIndex - 1)}ms`,
      }}
    >
      {squares.map((_, i) => (
        <GridItem
          ref={(refNode) => (gridItemsRefs.current[i] = refNode)}
          key={i}
          size={size}
          baseColor={baseColor}
        />
      ))}
    </div>
  );
}

function _GridItem(
  {
    size,
    baseColor = "#ff0",
  }: {
    size: number;
    baseColor?: string;
  },
  externalRef: ForwardedRef<{ updateColor: () => void }>
) {
  const ref = useRef<HTMLDivElement>(null);
  function calculateNewRandomColorStrength() {
    const color = chromajs.hex(baseColor).alpha(1 - Math.random() * 0.3);
    return color;
  }
  const [randomColorStrength, setRandomColorStrength] =
    useState<chromajs.Color>(calculateNewRandomColorStrength);

  useImperativeHandle(
    externalRef,
    () => ({
      updateColor: () => {
        setRandomColorStrength(calculateNewRandomColorStrength());
      },
    }),
    []
  );

  return (
    <div
      ref={ref}
      className={Styles.gridItem}
      style={{
        width: size,
        height: size,
        ...({ "--pixel-color": randomColorStrength.hex() } as any),
      }}
    />
  );
}
const GridItem = forwardRef(_GridItem);
