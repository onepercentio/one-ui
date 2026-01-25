import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Input/Input.stories";

it("All examples mount at least", () => {
  cy.viewport(500, 800);
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    cy.log("Rendering", Example.name);
    const chain = cy.mountChain((args: any) => (
      <div>
        <Example {...args} />
        <div
          style={{ width: "100%", height: 30, backgroundColor: "red" }}
        ></div>
      </div>
    ));
    chain.remount({});
    cy.pause().wait(500);
    chain.remount(Example.args);
    cy.pause().wait(500);
  }
});
