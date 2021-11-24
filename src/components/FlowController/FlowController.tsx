import React, { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import Button from "../Button";
import Styles from "./FlowController.module.scss";

export type FlowControlState = "disabled" | "enabled" | "hidden";
/**
 * Container for a flow, managing the go back and close controller
 **/
export default function FlowController<
  E extends Pick<JSX.IntrinsicElements, "div" | "form">,
  W extends keyof E
>({
  children,
  buttons,
  step,
  onClose,
  onBack, 
  fullPage,
  firstStep = 0,
  style,
  wrapper: Wrapper = "div" as any,
}: {
  onClose?: () => void;
  onBack?: () => void;
  step: number;
  firstStep?: number;
  buttons: {
    label: string;
    onClick: () => void;
    state: FlowControlState;
  }[];
  children: React.ReactElement[];
  fullPage?: boolean;
  style?: React.CSSProperties;
  wrapper?: React.ElementType;
} & E[W]) {
  function _handleBackPress() {
    if (isAtFirstStep) onClose && onClose();
    else if (onBack) onBack();
  }

  const [screensStack, setScreensStack] = useState([
    <div key={step}>{children[step]}</div>,
  ]);
  const prevStep = useRef(step);
  useEffect(() => {
    if (prevStep.current > step) {
      setScreensStack((screensBeforeChangingStep) => [
        <div
          key={step}
          className={`${Styles.entranceLeft} ${
            fullPage ? Styles.fullHeight : ""
          }`}
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
          className: `${Styles.exitLeft} ${
            lastScreen.props.className?.includes(Styles.fullHeight)
              ? Styles.fullHeight
              : ""
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
          <div key={step} className={fullPage ? Styles.fullHeight : ""}>
            {children[step]}
          </div>,
        ];
      });
    }
    return () => {
      prevStep.current = step;
    };
  }, [step]);

  const isAtFirstStep = step === firstStep;

  const shouldDisplayHeaderButton =
    (isAtFirstStep && onClose) || (!isAtFirstStep && onBack);

  return (
    <Wrapper
      onClick={(e: MouseEvent) => e.stopPropagation()}
      className={Styles.container}
      style={style}
    >
      <header>
        {shouldDisplayHeaderButton && (
          <HeaderButton
            mode={isAtFirstStep ? "close" : "back"}
            hidden={!onBack}
            onClick={_handleBackPress}
          />
        )}
      </header>
      <section>{screensStack}</section>
      <footer
        className={
          buttons.find((b) => b.state === "hidden") ? Styles.hidden : undefined
        }
      >
        {buttons.map((b) => (
          <Button
            onClick={b.onClick}
            disabled={b.state === "hidden" || b.state === "disabled"}
          >
            {b.label}
          </Button>
        ))}
      </footer>
    </Wrapper>
  );
}

export function HeadingImage({ src }: { src: string }) {
  return <img src={src} className={Styles.headingImg} />;
}

function HeaderButton({
  mode,
  hidden,
  onClick,
}: {
  mode: "back" | "close";
  hidden: boolean;
  onClick: () => void;
}) {
  return (
    <div
      data-testid="header-control-back"
      className={`${Styles.headerButton} ${Styles[mode]} ${
        hidden ? Styles.pointOfNoReturn : ""
      }`}
      onClick={onClick}
    >
      <div />
      <div />
    </div>
  );
}
