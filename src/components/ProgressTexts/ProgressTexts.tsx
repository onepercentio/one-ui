import React, { ComponentProps, MouseEvent, ReactElement } from "react";
import Spacing from "../Spacing";
import Text from "../Text";
import Styles from "./ProgressTexts.module.scss";
import Button from "../Button";

type Step = {
  type: "wait" | "final";
  title?: string;
  description?: string | React.ReactElement;
  action?: {
    label: string | ReactElement;
    onClick: (e: MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    variant?: ComponentProps<typeof Button>["variant"];
  };
};

/**
 * Displays new texts as they are pushed into the steps property allowing for a nice progress follow experience
 **/
export default function ProgressTexts({
  steps,
  currentStep,
  spacingOnEachStep = true,
}: {
  /**
   * Starts at 0
   */
  currentStep: number;
  steps: Step[];
  spacingOnEachStep?: boolean;
}) {
  const _currentStep = steps[currentStep];
  return (
    <>
      {steps.map((s, i) => {
        function whichClassToUse(
          step: number,
          stepType: Step["type"],
          currentStep: number,
          currentStepType: Step["type"]
        ) {
          const classes = [Styles.container];

          // Decides the color
          if (stepType !== "final")
            classes.push(step < currentStep ? Styles.disabled : Styles.loading);

          // Decides if should be visible or not
          classes.push(
            currentStep !== step && currentStepType === "final"
              ? Styles.hidden
              : ""
          );

          return classes.join(" ");
        }
        return i <= currentStep ? (
          <div
            key={String(i)}
            ref={(a) => {
              if (a) a.style.maxHeight = `${a.scrollHeight}px`;
            }}
            className={whichClassToUse(
              i,
              s.type,
              currentStep,
              _currentStep.type
            )}
          >
            {s.title && <h1>{s.title}</h1>}
            {s.description && <p>{s.description}</p>}
            {s.action && (
              <Button variant={s.action.variant} onClick={s.action.onClick} disabled={s.action.disabled}>
                {s.action.label}
              </Button>
            )}
            {spacingOnEachStep !== false ? <Spacing size="large" /> : null}
          </div>
        ) : null;
      })}
    </>
  );
}
