import React, {
  ComponentProps,
  ElementRef,
  FunctionComponent,
  HTMLAttributes,
  HTMLProps,
  ReactElement,
  useEffect,
  useRef,
} from "react";
import Button from "../Button";
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
} & ComponentProps<E>) {
  const uncontrolledRef =
    useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionDiv = uncontrolledRef.current!.sectionRef.current;
    if (sectionDiv)
      if (direction === "h") {
        sectionDiv.style.width = `${sectionDiv.clientWidth}px`;
        sectionDiv.style.height = ``;
      } else {
        sectionDiv.style.height = `${sectionDiv.clientHeight}px`;
        sectionDiv.style.width = ``;
      }
    const t = setTimeout(() => {
      if (uncontrolledRef.current) {
        const sectionDiv = uncontrolledRef.current.sectionRef.current;
        if (sectionDiv) {
          const lastChild = sectionDiv.lastChild as HTMLDivElement;
          if (lastChild) {
            function resetFactory(param: "height" | "width", target: number) {
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
              sectionDiv.style.width = targetWidth;
              const func = resetFactory("width", contentWidth);
              if (targetWidth === sectionDiv.style.width)
                func({ propertyName: "width" });
              else sectionDiv.addEventListener("transitionend", func);
            } else {
              const contentHeight = lastChild.scrollHeight;
              const targetHeight = `${contentHeight}px`;
              sectionDiv.style.height = targetHeight;
              const func = resetFactory("height", contentHeight);
              if (targetHeight === sectionDiv.style.height)
                func({ propertyName: "height" });
              else sectionDiv.addEventListener("transitionend", func);
            }
          }
        }
      }
    }, 100);
    return () => clearTimeout(t);
  }, [children.key, direction]);
  const Wrapper = _Wrapper as any;

  return (
    <>
      <Wrapper
        className={`${className}`}
        ref={buttonRef}
        {...otherProps}
      >
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
          className={`${Styles.resetSection} ${Styles[direction]}`}
        >
          {children}
        </UncontrolledTransition>
      </Wrapper>
    </>
  );
}
