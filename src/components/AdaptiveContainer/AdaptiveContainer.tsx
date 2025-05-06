import React, {
  ComponentProps,
  ElementRef,
  FunctionComponent,
  HTMLAttributes,
  HTMLProps,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { TransitionAnimationTypes } from "../Transition";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./AdaptiveContainer.module.scss";

/**
 * A container that animates width changes across content updates
 **/
export default function AdaptiveContainer<
  E extends keyof JSX.IntrinsicElements | FunctionComponent
>({
  children,
  className = "",
  containerElement: _Wrapper = "div" as any,
  direction = "h",
  strict = true,
  ...otherProps
}: {
  containerElement?: E;
  children: ReactElement;
  /**
   * The direction in which the content will be resized
   *
   *     "h" // When the content will change in width
   *     "v" // When the content will change in height
   */
  direction?: "h" | "v";
  className?: string;
  contentClassName?: string;
  /**
   * true: It will animate restricting to the height when it was rendered
   * false: It will animate trying to reach the height when it was rendered, growing in size if the content inside it changes */
  strict?: boolean;
} & ComponentProps<E>) {
  const animatedProperty = useMemo(() => {
    switch (direction) {
      case "h":
        return strict
          ? ("width" as const)
          : (() => {
              throw new Error(
                `Strict false only works with direction "v" at the moment`
              );
            })();
      case "v":
        return strict ? ("height" as const) : ("minHeight" as const);
    }
  }, [direction, strict]);
  const uncontrolledRef =
    useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const transitionContainer = uncontrolledRef.current!.sectionRef.current;
    if (transitionContainer)
      if (direction === "h") {
        transitionContainer.style.width = `${transitionContainer.clientWidth}px`;
        transitionContainer.style[animatedProperty] = ``;
      } else {
        transitionContainer.style[
          animatedProperty
        ] = `${transitionContainer.clientHeight}px`;
        transitionContainer.style.width = ``;
      }
    const t = setTimeout(() => {
      if (uncontrolledRef.current) {
        const transitionContainer = uncontrolledRef.current.sectionRef.current;
        if (transitionContainer) {
          const screenThatWillEnter =
            transitionContainer.lastChild as HTMLDivElement;
          if (screenThatWillEnter) {
            function resetFactory(
              param: "minHeight" | "height" | "width",
              target: number
            ) {
              const resetPropertyInstance = (e: Pick<TransitionEvent, "propertyName">) => {
                if (e.propertyName !== param) return;
                setTimeout(() => {
                  if (transitionContainer?.style[param] === `${target}px`) {
                    transitionContainer!.style[param] = "";
                  }
                }, 100);

                if (transitionContainer)
                  transitionContainer.removeEventListener(
                    "transitionend",
                    resetPropertyInstance
                  );
              };
              return resetPropertyInstance;
            }
            if (direction === "h") {
              const contentWidth = screenThatWillEnter.clientWidth;
              const targetWidth = `${contentWidth}px`;
              const prevWidth = transitionContainer.style.width;
              transitionContainer.style.width = targetWidth;
              const func = resetFactory("width", contentWidth);
              if (targetWidth === prevWidth) func({ propertyName: "width" });
              else transitionContainer.addEventListener("transitionend", func);
            } else {
              const contentHeight = screenThatWillEnter.scrollHeight;
              const targetHeight = `${contentHeight}px`;
              const prevHeight = transitionContainer.style[animatedProperty];
              transitionContainer.style[animatedProperty] = targetHeight;
              const resetProperty = resetFactory(
                animatedProperty,
                contentHeight
              );
              if (targetHeight === prevHeight)
                resetProperty({ propertyName: animatedProperty });
              else
                transitionContainer.addEventListener(
                  "transitionend",
                  resetProperty
                );
            }
          }
        }
      }
    }, 100);
    return () => clearTimeout(t);
  }, [children.key, direction]);
  const Wrapper = _Wrapper as any;
  const directionClass = direction in Styles ? Styles[direction] : "";

  return (
    <>
      <Wrapper className={`${className}`} ref={buttonRef} {...otherProps}>
        <UncontrolledTransition
          ref={uncontrolledRef}
          transitionType={TransitionAnimationTypes.CUSTOM}
          lockTransitionWidth={false}
          config={{
            backward: {
              elementExiting: Styles.fadeOutAbsolute,
              elementEntering: Styles.fadeInDelayed,
            },
            forward: {
              elementExiting: Styles.fadeOutAbsolute,
              elementEntering: Styles.fadeInDelayed,
            },
          }}
          className={`${Styles.resetSection} ${directionClass}`}
          contentClassName={otherProps.contentClassName}
        >
          {children}
        </UncontrolledTransition>
      </Wrapper>
    </>
  );
}
