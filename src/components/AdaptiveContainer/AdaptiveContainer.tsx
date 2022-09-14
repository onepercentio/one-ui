import React, {
  ComponentProps,
  ElementRef,
  FunctionComponent,
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
export default function AdaptiveContainer({
  children,
  className = "",
  containerElement: _Wrapper = "div",
  ...otherProps
}: {
  containerElement?: keyof JSX.IntrinsicElements | FunctionComponent;
  children: ReactElement;
} & {
  [k: string]: any;
}) {
  const uncontrolledRef =
    useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const buttonRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sectionDiv = uncontrolledRef.current!.sectionRef.current;
    if (sectionDiv) sectionDiv.style.width = `${sectionDiv.clientWidth}px`;
    setTimeout(() => {
      if (uncontrolledRef.current) {
        const sectionDiv = uncontrolledRef.current.sectionRef.current;
        if (sectionDiv) {
          const lastChild = sectionDiv.lastChild as HTMLDivElement;
          if (lastChild) {
            const contentWidth = lastChild.clientWidth;
            const targetWidth = `${contentWidth}px`;
            sectionDiv.style.width = targetWidth;
            function transEnd() {
              setTimeout(() => {
                if (sectionDiv?.style.width === `${contentWidth}px`)
                  sectionDiv!.style.width = "";
              }, 100);

              if (sectionDiv)
                sectionDiv.removeEventListener("transitionend", transEnd);
            }
            sectionDiv.addEventListener("transitionend", transEnd);
          }
        }
      }
    }, 100);
  }, [children.key]);
  const Wrapper = _Wrapper as any;

  return (
    <>
      <Wrapper
        className={`${Styles.resetButton} ${className}`}
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
          className={Styles.resetSection}
        >
          {children}
        </UncontrolledTransition>
      </Wrapper>
    </>
  );
}
