import React, {
  createRef,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import Styles from "./Transition.module.scss";

export type TransitionTypeDefinitions =
  | {
      transitionType?:
        | TransitionAnimationTypes.SLIDE
        | TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN;
    }
  | {
      transitionType?: TransitionAnimationTypes.POP_FROM_ELEMENT_ID;
      elementId: string;
    };

export type TransitionProps = {
  step: number;
  className?: string;
  contentStyle?: React.CSSProperties;
  contentClassName?: string;
  children: (React.ReactElement | undefined)[];
  onDiscardStep?: (discardedKey: React.Key) => void;
  lockTransitionWidth?: boolean;
} & TransitionTypeDefinitions;

function TransitionClasses(
  type: NonNullable<TransitionProps["transitionType"]>
): {
  /**
   * Applied to the element that was not visible and is now entering the screen
   */
  backward: {
    elementEntering: string;
    elementExiting: string;
  };
  /**
   * Applied to the element that was visible and now is exiting the screen
   */
  forward: {
    elementEntering: string;
    elementExiting: string;
  };
} {
  switch (type) {
    case TransitionAnimationTypes.SLIDE:
      return {
        backward: {
          elementEntering: Styles.entranceLeft,
          elementExiting: "",
        },
        forward: {
          elementEntering: "",
          elementExiting: Styles.exitLeft,
        },
      };
    case TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN:
    case TransitionAnimationTypes.POP_FROM_ELEMENT_ID:
      return {
        backward: {
          elementEntering: Styles.fadeIn,
          elementExiting: Styles.scaleOut,
        },
        forward: {
          elementEntering: Styles.scaleIn,
          elementExiting: Styles.fadeOut,
        },
      };
  }
}

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
  transitionType = TransitionAnimationTypes.SLIDE,
  ...props
}: TransitionProps) {
  const preTransitionDetails = useRef<{
    transformOrigin: `${number}% ${number}%` | `initial`;
  }>({
    transformOrigin: "initial",
  });
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
    const transitionClasses = TransitionClasses(transitionType);

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
      setScreensStack((screensBeforeChangingStep) => {
        const enteringScreenRef = createRef<HTMLDivElement>();
        const [firstNextScreen, ...restOfScreens] =
          screensBeforeChangingStep.filter((a) => a.key !== String(key));
        const clonedFirst = React.cloneElement(firstNextScreen, {
          "data-testid": "transition-container",
          style: {
            ...contentStyle,
          },
          className: `${transitionClasses.backward.elementExiting} ${
            firstNextScreen.props.className?.replace(
              transitionClasses.backward.elementEntering,
              ""
            ) || ""
          }`,
        });
        return [
          <div
            ref={enteringScreenRef}
            data-testid="transition-container"
            key={key}
            className={`${transitionClasses.backward.elementEntering} ${contentClassName}`}
            style={{
              ...contentStyle,
            }}
            onAnimationEnd={() => {
              enteringScreenRef.current?.classList.remove(
                transitionClasses.backward.elementEntering
              );
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
          clonedFirst,
          ...restOfScreens,
        ];
      });
    } else if (prevStep.current < step) {
      const stepToDelete = prevStep.current;
      const prevKeyToRemove = prevKey.current || stepToDelete;
      setScreensStack((screensBeforeChangingStep) => {
        const lastIndex = screensBeforeChangingStep.length - 1;
        const lastScreen = screensBeforeChangingStep[lastIndex];
        const nextScreenRef = createRef<HTMLDivElement>();
        const clonedLast = React.cloneElement(lastScreen, {
          "data-testid": "transition-container",
          style: {
            ...contentStyle,
          },
          className: `${contentClassName} ${transitionClasses.forward.elementExiting}`,
          onAnimationEnd: () => {
            if (transitionClasses.forward.elementEntering)
              nextScreenRef.current?.classList.remove(
                transitionClasses.forward.elementEntering
              );
            if (onDiscardStep) onDiscardStep(prevKeyToRemove);
            setScreensStack((screensAfterTheCurrentStepEntered) => {
              const nextState = screensAfterTheCurrentStepEntered.filter(
                (s) => {
                  return s.key !== String(prevKeyToRemove);
                }
              );
              return nextState;
            });
          },
        });

        return [
          ...screensBeforeChangingStep.slice(0, lastIndex),
          clonedLast,
          <div
            ref={nextScreenRef}
            data-testid="transition-container"
            key={key}
            style={{
              ...contentStyle,
            }}
            className={`${contentClassName} ${transitionClasses.forward.elementEntering}`}
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

  useEffect(() => {
    if (
      transitionType === TransitionAnimationTypes.POP_FROM_ELEMENT_ID &&
      "elementId" in props
    ) {
      const element = document.querySelector(
        `#${props.elementId}`
      ) as HTMLDivElement;

      if (element) {
        const { clientWidth, clientHeight } = containerRef.current!;

        const offsetX =
          element.clientLeft + element.offsetLeft + element.clientWidth / 2;
        const offsetY =
          element.clientTop + element.offsetTop + element.clientHeight / 2;
        const percentX = (offsetX * 100) / clientWidth;
        const percentY = (offsetY * 100) / clientHeight;
        preTransitionDetails.current.transformOrigin = `${percentX}% ${percentY}%`;

        Object.assign(containerRef.current!.style, {
          transformOrigin: `${percentX}% ${percentY}%`,
        });
      }
    } else {
      Object.assign(containerRef.current!.style, preTransitionDetails.current);
    }
  }, [screensStack.length]);

  return (
    <>
      <section
        onClick={({
          currentTarget: { offsetTop, offsetLeft, clientWidth, clientHeight },
          clientX,
          clientY,
        }) => {
          const offsetX = clientX - offsetLeft;
          const offsetY = clientY - offsetTop;
          const percentX = (offsetX * 100) / clientWidth;
          const percentY = (offsetY * 100) / clientHeight;

          preTransitionDetails.current.transformOrigin = `${percentX}% ${percentY}%`;
        }}
        data-testid="transition-controller"
        ref={containerRef}
        className={`${Styles.section} ${className}`}
      >
        {screensStack}
      </section>
    </>
  );
}

export enum TransitionAnimationTypes {
  SLIDE,
  POP_FROM_CLICK_ORIGIN,
  POP_FROM_ELEMENT_ID,
}
