import React, {
  ComponentProps,
  ElementRef,
  ReactElement,
  useEffect,
  useRef,
} from "react";
import Button from "../Button";
import { TransitionAnimationTypes } from "../Transition";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./AdaptiveButton.module.scss";

/**
 * A button that adapts it's width according to the content size
 **/
export default function AdaptiveButton({
  children,
  className = "",
  ...buttonProps
}: {
  children: ReactElement;
} & ComponentProps<typeof Button>) {
  const uncontrolledRef =
    useRef<ElementRef<typeof UncontrolledTransition>>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sectionDiv = uncontrolledRef.current!.sectionRef.current;
    if (sectionDiv) sectionDiv.style.width = `${sectionDiv.clientWidth}px`;
    setTimeout(() => {
      const sectionDiv = uncontrolledRef.current!.sectionRef.current;
      if (sectionDiv) {
        const lastChild = sectionDiv.lastChild as HTMLDivElement;
        if (lastChild) {
          const contentWidth = lastChild.clientWidth;
          sectionDiv.style.width = `${contentWidth}px`;
          function transEnd() {
            sectionDiv!.style.width = "";
          }
          sectionDiv.addEventListener("transitionend", transEnd);
        }
      }
    }, 100);
  }, [children.key]);

  return (
    <>
      <Button
        className={`${Styles.resetButton} ${className}`}
        ref={buttonRef}
        {...buttonProps}
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
      </Button>
    </>
  );
}
