import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import Styles from "./Transition.module.scss";

/**
 * Handles the transition between multiple children and recycling of elements
 **/
export default function Transition({
  step,
  contentStyle,
  contentClassName = "",
  children,
  className,
  onDiscardStep,
  lockTransitionWidth = false,
}: {
  step: number;
  className?: string;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
  children: (React.ReactElement | undefined)[];
  onDiscardStep?: (discardedKey: React.Key) => void;
  lockTransitionWidth?: boolean;
}) {
  const containerRef = useRef<HTMLElement>(null);
  const [screensStack, setScreensStack] = useState([
    <div
      data-testid="transition-container"
      key={String(children[step]?.key || step)}
      style={contentStyle}
      className={contentClassName}
    >
      {children[step]}
    </div>,
  ]);

  const prevStep = useRef(step);
  const prevKey = useRef(children[step]?.key);

  useEffect(() => {
    if (
      prevKey.current !== null &&
      children[step]?.key === prevKey.current // I'm rendering the same screen
    ) {
      return () => {
        prevStep.current = step;
      };
    }

    const key = children[step]?.key || step;

    if (prevStep.current !== step && lockTransitionWidth)
      containerRef.current!.style.width = `${
        containerRef.current!.clientWidth
      }px`;

    if (prevStep.current > step) {
      const stepToRemove = prevStep.current;
      const prevKeyToRemove = prevKey.current || stepToRemove;
      setScreensStack((screensBeforeChangingStep) => [
        <div
          data-testid="transition-container"
          key={key}
          className={`${Styles.entranceLeft} ${contentClassName}`}
          style={contentStyle}
          onAnimationEnd={() => {
            setScreensStack((screensAfterTheCurrentStepEntered) => {
              if (onDiscardStep) onDiscardStep(prevKeyToRemove);
              return screensAfterTheCurrentStepEntered.filter(
                (s) => s.key !== String(prevKeyToRemove)
              );
            });
          }}
        >
          {children[step]}
        </div>,
        ...screensBeforeChangingStep.filter((a) => a.key !== String(key)),
      ]);
    } else if (prevStep.current < step) {
      const stepToDelete = prevStep.current;
      const prevKeyToRemove = prevKey.current || stepToDelete;
      setScreensStack((screensBeforeChangingStep) => {
        const lastIndex = screensBeforeChangingStep.length - 1;
        const lastScreen = screensBeforeChangingStep[lastIndex];
        const clonedLast = React.cloneElement(lastScreen, {
          "data-testid": "transition-container",
          style: contentStyle,
          className: `${Styles.exitLeft} ${
            lastScreen.props.className?.replace(Styles.entranceLeft, "") || ""
          }`,
          onAnimationEnd: () => {
            if (onDiscardStep) onDiscardStep(prevKeyToRemove);
            setScreensStack((screensAfterTheCurrentStepEntered) => {
              return screensAfterTheCurrentStepEntered.filter((s) => {
                return s.key !== String(prevKeyToRemove);
              });
            });
          },
        });

        return [
          ...screensBeforeChangingStep.slice(0, lastIndex),
          clonedLast,
          <div
            data-testid="transition-container"
            key={key}
            style={contentStyle}
            className={contentClassName}
          >
            {children[step]}
          </div>,
        ];
      });
    }
    return () => {
      prevStep.current = step;
      prevKey.current = children[step]?.key;
    };
  }, [step]);

  useEffect(() => {
    if (screensStack.length === 1 && lockTransitionWidth)
      containerRef.current!.style.width = "";
  }, [screensStack.length !== 1]);

  return (
    <>
      <section
        data-testid="transition-controller"
        ref={containerRef}
        className={`${Styles.section} ${className}`}
      >
        {screensStack}
      </section>
    </>
  );
}
