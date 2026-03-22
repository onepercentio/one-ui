import React, {
  ComponentProps,
  ElementRef,
  FunctionComponent,
  JSX,
  ReactElement,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { TransitionAnimationTypes } from "../Transition";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./AdaptiveContainer.module.scss";

/**
 * A container that animates width/height changes across UI updates
 **/
export default function AdaptiveContainer<
  E extends keyof JSX.IntrinsicElements | FunctionComponent,
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
  direction?: "h" | "v" | "both";
  className?: string;
  contentClassName?: string;
  /**
   * true: It will animate restricting to the height when it was rendered
   * false: It will animate trying to reach the height when it was rendered, growing in size if the content inside it changes */
  strict?: boolean;
} & ComponentProps<E>) {
  const animatedProperty = useMemo(() => {
    if (!strict && direction !== "v")
      throw new Error(
        `Strict false only works with direction "v" at the moment`,
      );
    switch (direction) {
      case "both":
        return ["width", "height"] as const;
      case "h":
        return "width" as const;
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
      if (direction === "both") {
        transitionContainer.style.width = `${transitionContainer.clientWidth}px`;
        transitionContainer.style.height = `${transitionContainer.clientHeight}px`;
      } else if (direction === "h") {
        transitionContainer.style.width = `${transitionContainer.clientWidth}px`;
        transitionContainer.style[animatedProperty as "width"] = ``;
      } else {
        transitionContainer.style[animatedProperty as "height"] =
          `${transitionContainer.clientHeight}px`;
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
              target: number,
            ) {
              const resetPropertyInstance = (
                e: Pick<TransitionEvent, "propertyName">,
              ) => {
                if (e.propertyName !== param) return;
                setTimeout(() => {
                  if (transitionContainer?.style[param] === `${target}px`) {
                    transitionContainer!.style[param] = "";
                  }
                }, 100);

                if (transitionContainer)
                  transitionContainer.removeEventListener(
                    "transitionend",
                    resetPropertyInstance,
                  );
              };
              return resetPropertyInstance;
            }
            if (direction === "both") {
              const contentSize = {
                width: screenThatWillEnter.clientWidth,
                height: screenThatWillEnter.scrollHeight,
              };

              const targetSize = {
                width: `${contentSize.width}px`,
                height: `${contentSize.height}px`,
              };

              const prevSize = {
                width: transitionContainer.style.width,
                height: transitionContainer.style.height,
              };

              transitionContainer.style.width = targetSize.width;
              transitionContainer.style.height = targetSize.height;

              if (Array.isArray(animatedProperty))
                for (let prop of animatedProperty as ("width" | "height")[]) {
                  const resetProperty = resetFactory(prop, contentSize[prop]);
                  if (targetSize[prop] === prevSize[prop])
                    resetProperty({ propertyName: prop });
                  else
                    transitionContainer.addEventListener(
                      "transitionend",
                      resetProperty,
                    );
                }
            } else if (direction === "h") {
              const contentWidth = screenThatWillEnter.clientWidth;
              const targetWidth = `${contentWidth}px`;
              const prevWidth = transitionContainer.style.width;
              transitionContainer.style.width = targetWidth;
              const func = resetFactory("width", contentWidth);
              if (targetWidth === prevWidth) func({ propertyName: "width" });
              else transitionContainer.addEventListener("transitionend", func);
            } else {
              const _animatedProperty = animatedProperty as "width";
              const contentHeight = screenThatWillEnter.scrollHeight;
              const targetHeight = `${contentHeight}px`;
              const prevHeight = transitionContainer.style[_animatedProperty];
              transitionContainer.style[_animatedProperty] = targetHeight;
              const resetProperty = resetFactory(
                _animatedProperty,
                contentHeight,
              );
              if (targetHeight === prevHeight)
                resetProperty({ propertyName: _animatedProperty });
              else
                transitionContainer.addEventListener(
                  "transitionend",
                  resetProperty,
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
