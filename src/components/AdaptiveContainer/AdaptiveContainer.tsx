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
    const sectionDiv = uncontrolledRef.current!.sectionRef.current;
    if (sectionDiv)
      if (direction === "h") {
        sectionDiv.style.width = `${sectionDiv.clientWidth}px`;
        sectionDiv.style[animatedProperty] = ``;
      } else {
        sectionDiv.style[animatedProperty] = `${sectionDiv.clientHeight}px`;
        sectionDiv.style.width = ``;
      }
    const t = setTimeout(() => {
      if (uncontrolledRef.current) {
        const sectionDiv = uncontrolledRef.current.sectionRef.current;
        if (sectionDiv) {
          const lastChild = sectionDiv.lastChild as HTMLDivElement;
          if (lastChild) {
            function resetFactory(
              param: "minHeight" | "height" | "width",
              target: number
            ) {
              const instance = (e: Pick<TransitionEvent, "propertyName">) => {
                if (e.propertyName !== param) return;
                setTimeout(() => {
                  if (sectionDiv?.style[param] === `${target}px`)
                    sectionDiv!.style[param] = "";
                }, 100);

                if (sectionDiv)
                  sectionDiv.removeEventListener("transitionend", instance);
              };
              return instance;
            }
            if (direction === "h") {
              const contentWidth = lastChild.clientWidth;
              const targetWidth = `${contentWidth}px`;
              const prevWidth = sectionDiv.style.width;
              sectionDiv.style.width = targetWidth;
              const func = resetFactory("width", contentWidth);
              if (targetWidth === prevWidth) func({ propertyName: "width" });
              else sectionDiv.addEventListener("transitionend", func);
            } else {
              const contentHeight = lastChild.scrollHeight;
              const targetHeight = `${contentHeight}px`;
              const prevHeight = sectionDiv.style[animatedProperty];
              sectionDiv.style[animatedProperty] = targetHeight;
              const func = resetFactory(animatedProperty, contentHeight);
              if (targetHeight === prevHeight)
                func({ propertyName: animatedProperty });
              else sectionDiv.addEventListener("transitionend", func);
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
