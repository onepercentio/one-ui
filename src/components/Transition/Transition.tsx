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
}: {
  step: number;
  className?: string;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
  children: React.ReactElement[];
}) {
  const [screensStack, setScreensStack] = useState([
    <div key={step} style={contentStyle} className={contentClassName}>
      {children[step]}
    </div>,
  ]);
  const prevStep = useRef(step);
  useEffect(() => {
    if (prevStep.current > step) {
      setScreensStack((screensBeforeChangingStep) => [
        <div
          key={step}
          className={`${Styles.entranceLeft} ${contentClassName}`}
          style={contentStyle}
          onAnimationEnd={() =>
            setScreensStack((screensAfterTheCurrentStepEntered) =>
              screensAfterTheCurrentStepEntered.filter(
                (s) => s !== screensBeforeChangingStep[0]
              )
            )
          }
        >
          {children[step]}
        </div>,
        ...screensBeforeChangingStep,
      ]);
    } else if (prevStep.current < step) {
      const stepToDelete = prevStep.current;
      setScreensStack((screensBeforeChangingStep) => {
        const lastIndex = screensBeforeChangingStep.length - 1;
        const lastScreen = screensBeforeChangingStep[lastIndex];
        const clonedLast = React.cloneElement(lastScreen, {
          style: contentStyle,
          className: `${Styles.exitLeft} ${
            lastScreen.props.className?.replace(Styles.entranceLeft, "") || ""
          }`,
          onAnimationEnd: () =>
            setScreensStack((screensAfterTheCurrentStepEntered) => {
              return screensAfterTheCurrentStepEntered.filter(
                (s) => s.key !== String(stepToDelete)
              );
            }),
        });

        return [
          ...screensBeforeChangingStep.slice(0, lastIndex),
          clonedLast,
          <div key={step} style={contentStyle} className={contentClassName}>
            {children[step]}
          </div>,
        ];
      });
    }
    return () => {
      prevStep.current = step;
    };
  }, [step]);
  return (
    <>
      <section className={`${Styles.section} ${className}`}>
        {screensStack}
      </section>
    </>
  );
}
