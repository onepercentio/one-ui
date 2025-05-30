import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/ProgressBar/ProgressBar.stories";
import ProgressBar from "components/ProgressBar";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

it.only("Should be able to show as various sections", () => {
  cy.mount(
    <div
      style={{
        "--progress-bar-bg": "red",
        "--progress-bar-guide": "blue",
        "--progress-bar-bar": "green",
      }}
    >
      <br />
      <h1>GAUGE</h1>
      <ProgressBar progress={50} size={40} mode="gauge" />
      <br />
      <h1>GUIDE</h1>
      <ProgressBar progress={50} size={40} mode="guide" />
      <br />
      <h1>sections</h1>
      <ProgressBar progress={21} size={10} mode="sections" sections={10} />
    </div>
  );
});
