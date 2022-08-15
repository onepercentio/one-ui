import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/AdaptiveDialog/AdaptiveDialog.stories";
import Component from "../../../../src/components/AdaptiveDialog";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});
it.only("Should animate entrance", () => {
  cy.viewport(1090, 1920);
  cy.mountChain((open: boolean) => (
    <div style={{
        backgroundColor: "#0f05",
        height: "100vh",
        width: "100vw",
        '--animation--speed-fast': '20s'
    } as any}>
    <Component open={open}>
      <h1>Somewhere</h1>
      <h2>Over the rainbow</h2>
      <h3>Bluebirds fly</h3>
    </Component>
    </div>
  ))
    .remount(false)
    .wait(1000)
    .remount(true);
});
