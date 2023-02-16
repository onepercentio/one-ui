import React, {
  ElementRef,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChartViewProps } from "./Chart.types";
import Styles from "./Chart.module.scss";
import { ChartDataTestIds } from "./Chart.e2e";
import AnchoredTooltip from "../AnchoredTooltip";
import throttle from "lodash/throttle";

const DEFAULT_STYLE = {
  lineColor: "#000",
  pointColor: "#000",
  textColor: "#fff",
};

function FloatingTooltip({
  children,
  x,
  y,
  hoverOnly,
  height,
  style,
}: {
  children: ReactNode;
  x: number;
  y: number;
  hoverOnly: boolean;
  height: number;
  style: Pick<
    NonNullable<NonNullable<ChartViewProps["style"]>[number]>,
    "pointColor" | "lineColor" | "textColor"
  >;
}) {
  const [ope, setOpen] = useState(() => (hoverOnly ? false : true));
  const ref = useRef<ElementRef<typeof AnchoredTooltip>>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  useEffect(() => {
    const animateEl = circleRef.current!.children.item(0) as SVGAnimateElement;
    let interval: NodeJS.Timeout;
    animateEl.addEventListener("beginEvent", () => {
      interval = setInterval(() => ref.current!.updatePosition(), 1000 / 24);
    });
    animateEl.addEventListener("endEvent", () => {
      clearInterval(interval);
      ref.current!.updatePosition();
    });
  }, []);

  const actions = useMemo(
    () =>
      hoverOnly
        ? {
            onMouseEnter: () => setOpen(true),
            onMouseOut: () => setOpen(false),
          }
        : {},
    [hoverOnly]
  );

  return (
    <>
      <circle
        ref={circleRef}
        r={height * 0.01}
        cx={x}
        cy={y}
        style={
          {
            "--point-color": style.pointColor,
          } as any
        }
        {...actions}
      >
        <animate attributeName="cy" values={`${height};${y}`} dur="1s" />
      </circle>
      <AnchoredTooltip
        ref={ref}
        containInViewport={false}
        anchorRef={circleRef as any}
        open={ope}
        className={Styles.tooltipContainer}
        style={{
          "--line-color": style.lineColor,
          "--text-color": style.textColor,
        }}
      >
        {children as any}
      </AnchoredTooltip>
    </>
  );
}

/**
 * Draws a simple line chart with some animation
 **/
export default function ChartView({
  bounds: [[startX, endX, stepsX], [startY, endY, stepsY]],
  data = [],
  points = [],
  label,
  style: groupStyle = [],
}: ChartViewProps) {
  const [dim, setDIm] = useState<{ width: number; height: number }>();
  const chartRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    setDIm({
      width: chartRef.current!.clientWidth,
      height: chartRef.current!.clientHeight,
    });
  }, []);
  const { width, height } = dim || {};

  const howMuchStepsY = useMemo(
    () => (endY - startY) / stepsY + 1,
    [endY, startY, stepsY]
  );
  const yAxis = useMemo(() => {
    return new Array(howMuchStepsY).fill(undefined).map((_, i) => {
      return <span>{label.y(endY - i * stepsY)}</span>;
    });
  }, [startY, endY, stepsY, howMuchStepsY]);

  const howMuchStepsX = useMemo(
    () => (endX - startX) / stepsX + 1,
    [endX, startX, stepsX]
  );
  const xAxis = useMemo(() => {
    return new Array(howMuchStepsX).fill(undefined).map((_, i) => {
      return <span>{label.x(startX + i * stepsX)}</span>;
    });
  }, [startX, endX, stepsX]);

  const { polylines, tooltips } = useMemo(() => {
    const calculate =
      (end: number, start: number, overrideScale: number = 100) =>
      (point: number) => {
        const max = end - start;
        const current = point - start;

        return (current * overrideScale) / max;
      };
    const calculateX = calculate(endX, startX, width);
    const calculateY = calculate(endY, startY, height);
    return {
      tooltips: points.map((pointsCategory, i) => {
        const style = groupStyle[i] || DEFAULT_STYLE;
        return pointsCategory.map(([x, y, label, onlyOnHover = false]) => {
          return (
            <FloatingTooltip
              x={calculateX(x)}
              y={height! - calculateY(y)}
              height={height!}
              style={style}
              hoverOnly={onlyOnHover}
            >
              {label}
            </FloatingTooltip>
          );
        });
      }),
      polylines: data.map((lineData, i) => {
        const style = groupStyle[i] || DEFAULT_STYLE;
        const calculateLines = (yOverride?: number) => {
          return lineData
            .map(
              ([x, y]) =>
                `${calculateX(x)},${
                  yOverride === undefined ? height! - calculateY(y) : yOverride
                }`
            )
            .join(" ");
        };
        return (
          <polyline
            strokeLinejoin="round"
            strokeLinecap="round"
            points={calculateLines()}
            fill="none"
            strokeWidth={5}
            style={
              {
                "--line-color": style.lineColor,
              } as any
            }
          >
            <animate
              attributeName="points"
              attributeType="XML"
              values={[calculateLines(height), calculateLines()].join("; ")}
              dur="1s"
            />
          </polyline>
        );
      }),
    };
  }, [data, width, height]);

  const paddingY = useMemo(() => {
    const stepSizeY = height! / (howMuchStepsY - 1);
    return stepSizeY / 2;
  }, [howMuchStepsY, height]);

  const paddingX = useMemo(() => {
    const stepSizeX = width! / (howMuchStepsX - 1);
    return stepSizeX / 2;
  }, [howMuchStepsX, width]);

  return (
    <div className={Styles.chartRoot}>
      <div className={Styles.yAxis} data-testid={ChartDataTestIds.Y_AXIS}>
        {yAxis}
      </div>
      <div ref={chartRef} className={Styles.chartContainer}>
        {width && (
          <svg
            className={Styles.chart}
            viewBox={`${-paddingX} ${-paddingY} ${width + paddingX * 2} ${
              height! + paddingY * 2
            }`}
            preserveAspectRatio="none"
          >
            {polylines}
            {tooltips}
          </svg>
        )}
      </div>
      &nbsp;
      <div className={Styles.xAxis} data-testid={ChartDataTestIds.X_AXIS}>
        {xAxis}
      </div>
    </div>
  );
}
