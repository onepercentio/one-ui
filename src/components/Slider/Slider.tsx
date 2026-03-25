import { ComponentProps, useEffect, useMemo, useRef, useState } from "react";
import ProgressBar, { BalancedProgressBar } from "../ProgressBar";
import { SLIDER_TEST_IDS } from "./Slider.e2e";
import throttle from "lodash/throttle";
import St from "./Slider.module.scss"

/**
 * A slider component that lets users select a value by dragging a handle.
 * It converts the mouse position into a value between the specified minimum and maximum.
 */
export default function Slider(
  p: Pick<
    ComponentProps<typeof BalancedProgressBar>,
    "size" | "min" | "max"
  > & { step?: number; value?: number; onChange(v: number): void }
) {
  const { value: externalValue, onChange } = p;
  const [controlledValue, setCurrValue] = useState(externalValue || p.min);
  const indicator = useRef<HTMLSpanElement>(null!);
  const body = useRef<HTMLDivElement>(null!);
  const throttleOnChange = useMemo(() => throttle(onChange, 1000 / 24), []);

  useEffect(() => {
    throttleOnChange(controlledValue);
  }, [controlledValue]);

  useEffect(() => {
    setTimeout(() => {
      const position = body.current.getBoundingClientRect();
      function updateValue(e: MouseEvent) {
        const isAt = e.pageX;
        const isAtRelativeToBodyWidth = isAt - position.x;
        const isAtPercent = (isAtRelativeToBodyWidth * 100) / position.width;
        const mathToFixed = Number(isAtPercent.toFixed(0));
        const normalized = p.min + (p.max - p.min) * (mathToFixed / 100);
        const stepNormalization = (() => {
          if (!p.step) return normalized;
          else {
            const modulus = normalized % p.step;
            const toOne = modulus / p.step;
            const rounded = Math.round(toOne);
            const incOrNot = rounded * p.step;
            const finalNormalization = normalized - modulus + incOrNot;
            return finalNormalization;
          }
        })();
        setCurrValue(
          stepNormalization < p.min
            ? p.min
            : stepNormalization > p.max
            ? p.max
            : stepNormalization
        );
      }
      indicator.current.setAttribute("data-testid", SLIDER_TEST_IDS.INDICATOR);
      indicator.current.classList.add(St.indicator)
      indicator.current.onmousedown = (e) => {
        updateValue(e);
        window.addEventListener("mousemove", updateValue);
        window.onmouseup = () => {
          window.removeEventListener("mousemove", updateValue);
        };
      };
    }, 500);
  }, []);

  return (
    <BalancedProgressBar
      current={externalValue || controlledValue}
      mode="guide"
      {...p}
      indicatorRef={indicator}
      bodyRef={body}
    />
  );
}