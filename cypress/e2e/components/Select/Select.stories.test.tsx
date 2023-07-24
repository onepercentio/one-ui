import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Select/Select.stories";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

it("Should be able to handle big lists", () => {
  cy.mount(<AllExamples.FullSelect />);
  cy.byTestId("full-example").wait(1000).parent().click().wait(500);
  cy.get("input").last().focus().realType("Option 12").wait(2000).realType("3");
});

it.only("Should use available space", () => {
  cy.mount(
    <AllExamples.InitialImplementation
      items={new Array(4).fill({
        label: "Item",
        value: "x",
      })}
      label="Example"
    />
  );
  cy.get("input").wait(1000).parent().click().wait(500);
});
