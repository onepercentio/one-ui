import React, { MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import Button from "../Button";
import Transition from "../Transition";
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
      <Transition
        step={step}
        className={Styles.transition}
        contentClassName={`${fullPage ? Styles.fullHeight : ""} ${
          Styles.content
        }`}
      >
        {children}
      </Transition>
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
