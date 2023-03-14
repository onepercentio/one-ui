import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Countdown/Countdown.stories";
import { InitialImplementation } from "../../../../src/components/Countdown/Countdown.stories";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

describe("Business rules", () => {
  it.only("Should be able to indicate which fields should be shown", () => {
    mount(<InitialImplementation timeRemaining={1000 * 60 * 2} />);
    cy.contains("01:58");
    cy.get("body").should("contain.text", "00:");
    mount(
      <InitialImplementation
        timeRemaining={1000 * 60 * 2}
        options={{
          hours: false,
        }}
      />
    );
    cy.contains("01:58");
    cy.get("body").should("not.contain.text", "00:");
  });
});
