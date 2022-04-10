import React, {
  AnimationEvent,
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
        | TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN
        | TransitionAnimationTypes.FADE;
    }
  | {
      transitionType?: TransitionAnimationTypes.POP_FROM_ELEMENT_ID;
      elementId: string;
    }
  | {
      transitionType?: TransitionAnimationTypes.CUSTOM;
      config: ReturnType<typeof TransitionClasses>;
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
  type: NonNullable<
    Exclude<TransitionProps["transitionType"], TransitionAnimationTypes.CUSTOM>
  >
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
    case TransitionAnimationTypes.FADE:
      return {
        backward: {
          elementExiting: Styles.fadeOutAbsolute,
          elementEntering: Styles.fadeInDelayed,
        },
        forward: {
          elementExiting: Styles.fadeOutAbsolute,
          elementEntering: Styles.fadeInDelayed,
        },
      };
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
    containerRef.current!.style.overflow = "hidden";
    const transitionClasses =
      props.transitionType === TransitionAnimationTypes.CUSTOM
        ? props.config
        : TransitionClasses(
            props.transitionType || TransitionAnimationTypes.SLIDE
          );

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
        function animationEndListener(element: AnimationEvent<HTMLDivElement>) {
          const isAnimationFromExpectedState =
            enteringScreenRef.current?.classList.contains(
              transitionClasses.backward.elementEntering
            );
          enteringScreenRef.current?.classList.remove(
            transitionClasses.backward.elementEntering
          );
          setScreensStack((screensAfterTheCurrentStepEntered) => {
            if (onDiscardStep && isAnimationFromExpectedState)
              onDiscardStep(prevKeyToRemove);
            return screensAfterTheCurrentStepEntered.filter(
              (s) => s.key !== String(prevKeyToRemove)
            );
          });
          element.currentTarget.removeEventListener(
            "animationend",
            animationEndListener as any
          );
        }
        return [
          <div
            ref={enteringScreenRef}
            data-testid="transition-container"
            key={key}
            className={`${transitionClasses.backward.elementEntering} ${contentClassName}`}
            style={{
              ...contentStyle,
            }}
            onAnimationEnd={animationEndListener}
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
          onAnimationEnd: (e: any) => {
            if (e.target !== e.currentTarget) return;
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
      props.transitionType === TransitionAnimationTypes.POP_FROM_ELEMENT_ID &&
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

    if (screensStack.length === 1) {
      containerRef.current!.style.overflow = "";
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
  FADE,
  CUSTOM,
}
