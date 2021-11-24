import React from "react";
import { render } from "@testing-library/react";

import Component from "./ProgressTexts";
import Styles from "./ProgressTexts.module.scss";

const CURRENT_STEPS = [
  {
    title: "First",
    type: "wait",
  },
  {
    title: "Second",
    type: "wait",
  },
  {
    title: "Final",
    type: "final",
  },
] as React.ComponentProps<typeof Component>["steps"];

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(<Component {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({ steps: CURRENT_STEPS, currentStep: 0 });
});
it("Lodash get works fine with undefined objects", () => {
  expect(require("lodash").get(undefined, "someprop", "default")).toEqual("default")
})

it("Should display the previous steps as gray", () => {
  const w = renderScreen({ steps: CURRENT_STEPS, currentStep: 1 });
  const firstText = w.getByText("First");
  const secondtext = w.getByText("Second");
  expect(firstText.parentElement!.classList).toContain(Styles.disabled);
  expect(secondtext.parentElement!.classList).toContain(Styles.loading);
});
it("When a new progress of type final is pushed, it should remove the previous elements", () => {
  const w = renderScreen({ steps: CURRENT_STEPS, currentStep: 2 });
  const firstText = w.getByText("First");
  const secondtext = w.getByText("Second");
  const finalText = w.getByText("Final");
  expect(firstText.parentElement!.classList).toContain(Styles.disabled);
  expect(firstText.parentElement!.classList).toContain(Styles.hidden);

  expect(secondtext.parentElement!.classList).toContain(Styles.disabled);
  expect(secondtext.parentElement!.classList).toContain(Styles.hidden);

  expect(finalText.parentElement!.classList).toContain(Styles.container);
});
it.todo(
  "Should animate loading indication under the text to indicate progress"
);
