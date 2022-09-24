import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/InfinityScroll/InfinityScroll.stories";
import Component, {
  InfinityDataTestId,
} from "../../../../src/components/InfinityScroll/InfinityScroll";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

describe.only("BUGFIX", () => {
  it("Should not lose order when scrolling pages", () => {
    function r(i: number, e: number) {
      return i % 3 === e ? 255 : 0;
    }
    const amount = new Array(10).fill(undefined).map((_, i) => (
      <h1
        style={{
          display: "inline-block",
          width: "23vw",
          margin: "0px 5vw",
          backgroundColor: `rgb(${r(i, 0)}, ${r(i, 1)}, ${r(i, 2)})`,
        }}
      >
        {i}
      </h1>
    ));
    cy.mount(
      <div data-testid="container">
        <Component items={amount} pageSize={3} />
      </div>
    );
    cy.wait(500);
    cy.byTestId("container").should("have.text", "789012345");

    cy.byTestId(InfinityDataTestId.ROOT)
      .scrollTo(1920 - 1920, 0, {
        duration: 1000,
      })
      .wait(500);
    cy.byTestId("container").should("have.text", "456789012");

    cy.byTestId(InfinityDataTestId.ROOT)
      .scrollTo(1920 + 1920, 0, {
        duration: 1000,
      })
      .wait(500);
    cy.byTestId("container").should("have.text", "789012345");
  });
});
