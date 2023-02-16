import React, {
  AnimationEvent,
  createRef,
  CSSProperties,
  ForwardedRef,
  forwardRef,
  Key,
  MutableRefObject,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Styles from "./Transition.module.scss";

export type TransitionTypeDefinitions =
  | {
      transitionType?:
        | TransitionAnimationTypes.SLIDE
        | TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN
        | TransitionAnimationTypes.FADE
        | TransitionAnimationTypes.COIN_FLIP;
    }
  | {
      transitionType?: TransitionAnimationTypes.POP_FROM_ELEMENT_ID;
      elementId: string;
    }
  | {
      transitionType?: TransitionAnimationTypes.MASK;
      /**
       * It provides the transition container so you can create a dynamic svg to mask with
       */
      maskFactory: (container: HTMLDivElement) => string;
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
  lockTransitionHeight?: boolean;
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
    case TransitionAnimationTypes.COIN_FLIP:
      return {
        backward: {
          elementExiting: Styles.flipBottomUpOut,
          elementEntering: Styles.flipBottomUpIn,
        },
        forward: {
          elementExiting: Styles.flipBottomUpOut,
          elementEntering: Styles.flipBottomUpIn,
        },
      };
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
    case TransitionAnimationTypes.MASK:
      return {
        backward: {
          elementEntering: Styles.stubEntering,
          elementExiting: Styles.stub,
        },
        forward: {
          elementEntering: Styles.stubEntering,
          elementExiting: Styles.stub,
        },
      };
  }
}

type ChildrenWrapper = ((props: {
  children: TransitionProps["children"][number];
}) => ReactElement) & {
  associatedKey: Key;
  toRemoveKeys?: Key[];
  externalProps: { [k: string]: any };
};

function ChildrenWrapperFactory(
  func: (p: { children: TransitionProps["children"] }) => ReactElement,
  key: Key,
  externalPropsContainer: { [k: string]: any },
  toRemoveKeys?: Key[]
): ChildrenWrapper {
  (func as any).associatedKey = key;
  (func as any).toRemoveKeys = toRemoveKeys;
  (func as any).externalProps = externalPropsContainer;
  return func as unknown as ChildrenWrapper;
}

/**
 * Handles the transition between multiple children and recycling of elements
 **/
function Transition(
  {
    step,
    contentStyle,
    contentClassName = "",
    children,
    className,
    onDiscardStep,
    lockTransitionWidth = false,
    lockTransitionHeight = false,
    ...props
  }: TransitionProps,
  _containerRef: ForwardedRef<HTMLDivElement | null>
) {
  const containerRef = useMemo(
    () =>
      (_containerRef as MutableRefObject<HTMLDivElement | null>) || createRef(),
    [_containerRef]
  );
  const preTransitionDetails = useRef<CSSProperties>({
    transformOrigin: "initial",
  });
  const [childrenWrappers, setChildrenWrappers] = useState<
    (ChildrenWrapper | undefined)[]
  >(() => {
    const externalProps = {
      "data-testid": "transition-container",
      key: String(children[step]?.key || step),
      style: contentStyle,
      className: contentClassName,
    };
    const func = ChildrenWrapperFactory(
      ({ children }) => <div {...externalProps}>{children}</div>,
      children[step]!.key || step,
      externalProps,
      []
    );
    return [func];
  });

  const prevStep = useRef(step);
  const prevChild = useRef(children[step]);

  useEffect(() => () => {
    prevChild.current = children[step];
  });

  useEffect(() => {
    containerRef.current!.style.overflow = "hidden";
    const transitionClasses =
      props.transitionType === TransitionAnimationTypes.CUSTOM
        ? props.config
        : TransitionClasses(
            props.transitionType || TransitionAnimationTypes.SLIDE
          );

    if (
      prevChild.current !== null &&
      children[step]?.key === prevChild.current?.key // I'm rendering the same screen
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

    if (prevStep.current !== step && lockTransitionHeight)
      containerRef.current!.style.height = `${
        containerRef.current!.clientHeight
      }px`;
    const transitionMask =
      props.transitionType === TransitionAnimationTypes.MASK
        ? props.maskFactory(containerRef.current!)
        : "";

    /** This runs on backwards */
    if (prevStep.current > step) {
      const stepToRemove = prevStep.current;
      const prevKeyToRemove = prevChild.current?.key || stepToRemove;
      setChildrenWrappers((screensBeforeChangingStep) => {
        const enteringScreenRef = createRef<HTMLDivElement>();
        const [FirstNextScreen, ...restOfScreens] =
          screensBeforeChangingStep.filter(
            (a) => a?.associatedKey !== String(key)
          );

        if (FirstNextScreen) {
          Object.assign(FirstNextScreen.externalProps, {
            "data-testid": "transition-container",
            style: { ...contentStyle, WebkitMaskImage: transitionMask },
            className: `${transitionClasses.backward.elementExiting}`,
          });
        }
        function animationEndListener(event: AnimationEvent<HTMLDivElement>) {
          if (event.target !== event.currentTarget) return;

          const isAnimationFromExpectedState =
            enteringScreenRef.current?.classList.contains(
              transitionClasses.backward.elementEntering
            );
          enteringScreenRef.current?.classList.remove(
            transitionClasses.backward.elementEntering
          );
          setChildrenWrappers((screensAfterTheCurrentStepEntered) => {
            if (onDiscardStep) {
              if (isAnimationFromExpectedState) onDiscardStep(prevKeyToRemove);
              if (FirstNextScreen && FirstNextScreen.toRemoveKeys)
                FirstNextScreen.toRemoveKeys.forEach(onDiscardStep);
            }
            return screensAfterTheCurrentStepEntered.filter((s) => {
              const shouldKeep =
                s?.associatedKey !== String(prevKeyToRemove) &&
                !FirstNextScreen?.toRemoveKeys?.some(
                  (k) => String(k) === String(s?.associatedKey)
                );
              return shouldKeep;
            });
          });
          event.currentTarget.removeEventListener(
            "animationend",
            animationEndListener as any
          );
        }
        const propsContainer = {
          ref: enteringScreenRef,
          "data-testid": "transition-container",
          key,
          className: `${transitionClasses.backward.elementEntering} ${contentClassName}`,
          style: {
            ...contentStyle,
          },
          onAnimationEnd: animationEndListener,
        };
        const newWrapper = ChildrenWrapperFactory(
          ({ children }) => {
            return <div {...propsContainer}>{children}</div>;
          },
          key,
          propsContainer,
          [prevKeyToRemove, ...(FirstNextScreen?.toRemoveKeys || [])]
        );
        if (FirstNextScreen)
          return [
            newWrapper,
            FirstNextScreen ||
              ChildrenWrapperFactory(() => <React.Fragment />, "", {}),
            ...restOfScreens,
          ];
        else return [newWrapper];
      });
    } else if (prevStep.current < step) {
      const stepToDelete = prevStep.current;
      const prevKeyToRemove = String(prevChild.current?.key || stepToDelete);
      setChildrenWrappers((screensBeforeChangingStep) => {
        const lastIndex = screensBeforeChangingStep.length - 1;
        const lastWrapper = screensBeforeChangingStep[lastIndex];
        const nextScreenRef = createRef<HTMLDivElement>();
        if (lastWrapper) {
          Object.assign(lastWrapper.externalProps, {
            "data-testid": "transition-container",
            style: { ...contentStyle, WebkitMaskImage: transitionMask },
            className: `${contentClassName} ${transitionClasses.forward.elementExiting}`,
            onAnimationEnd: (e: AnimationEvent) => {
              if (e.target !== e.currentTarget) return;
              if (transitionClasses.forward.elementEntering)
                nextScreenRef.current?.classList.remove(
                  transitionClasses.forward.elementEntering
                );
              if (onDiscardStep) onDiscardStep(prevKeyToRemove);
              setChildrenWrappers((screensAfterTheCurrentStepEntered) => {
                const nextState = screensAfterTheCurrentStepEntered.filter(
                  (s) => {
                    const shouldMantain =
                      s?.associatedKey !== String(prevKeyToRemove);
                    return shouldMantain;
                  }
                );
                return nextState;
              });
            },
          });
        }
        const propsContainer = {
          ref: nextScreenRef,
          "data-testid": "transition-container",
          key,
          style: {
            ...contentStyle,
          },
          className: `${contentClassName} ${transitionClasses.forward.elementEntering}`,
        };
        const newWrapper = ChildrenWrapperFactory(
          ({ children }) => {
            return <div {...propsContainer}>{children}</div>;
          },
          key,
          propsContainer
        );
        return [
          ...screensBeforeChangingStep.slice(0, lastIndex),
          lastWrapper ||
            ChildrenWrapperFactory(() => <React.Fragment />, "fallback", {}),
          newWrapper,
        ];
      });
    }
    return () => {
      prevStep.current = step;
    };
  }, [step]);

  useEffect(() => {
    if (childrenWrappers.length === 1 && lockTransitionWidth)
      containerRef.current!.style.width = "";
    if (childrenWrappers.length === 1 && lockTransitionHeight)
      containerRef.current!.style.height = "";
  }, [childrenWrappers.length !== 1]);

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

    if (childrenWrappers.length === 1) {
      containerRef.current!.style.overflow = "";
    }
  }, [childrenWrappers.length]);
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

          if (
            props.transitionType ===
              TransitionAnimationTypes.POP_FROM_ELEMENT_ID ||
            props.transitionType ===
              TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN
          )
            preTransitionDetails.current.transformOrigin = `${percentX}% ${percentY}%`;
        }}
        data-testid="transition-controller"
        ref={containerRef}
        className={`${Styles.section} ${className}`}
      >
        {(childrenWrappers as ChildrenWrapper[]).map((Wrapper) => {
          const childToRender = children.find(
            (a, i) => (a?.key || i) === Wrapper?.associatedKey
          );
          return (
            <Wrapper key={Wrapper?.associatedKey}>
              <>{childToRender}</>
            </Wrapper>
          );
        })}
      </section>
    </>
  );
}

export enum TransitionAnimationTypes {
  SLIDE,
  POP_FROM_CLICK_ORIGIN,
  POP_FROM_ELEMENT_ID,
  FADE,
  COIN_FLIP,
  MASK,
  CUSTOM,
}

export default forwardRef(Transition);
