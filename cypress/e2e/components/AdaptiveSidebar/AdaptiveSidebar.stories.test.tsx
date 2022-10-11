import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/AdaptiveSidebar/AdaptiveSidebar.stories";
import AdaptiveSidebar from "../../../../src/components/AdaptiveSidebar/AdaptiveSidebar";
import AdaptiveSidebarClasses from "../../../../src/components/AdaptiveSidebar/AdaptiveSidebar.module.scss";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

it.only("Should be able to trigger responsive mode on different resolutions", () => {
  mount(
    <AdaptiveSidebar breakInto={1000}>
      <h1 data-testid="content">Some arbitrary content</h1>
    </AdaptiveSidebar>
  );
  cy.viewport(300, 600)
    .wait(1000)
    .get(`.${AdaptiveSidebarClasses.hamburger}`)
    .should("have.css", "display", "block")
    .byTestId("content")
    .should("not.be.visible");
  cy.viewport(650, 800)
    .wait(1000)
    .get(`.${AdaptiveSidebarClasses.hamburger}`)
    .should("have.css", "display", "block")
    .byTestId("content")
    .should("not.be.visible");
  cy.viewport(1366, 768)
    .wait(1000)
    .get(`.${AdaptiveSidebarClasses.hamburger}`)
    .should("have.css", "display", "none")
    .byTestId("content")
    .should("be.visible");
});
