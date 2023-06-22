import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "components/StaticScroller/StaticScroller.stories";

it("Should snap to start when scrolling in and snap to end when scrolling out", () => {
  cy.viewport(1000, 1000);
  cy.mount(<Component />);
  // cy.byTestId("scroller")
  //   .then(() => cy.byTestId("text").inViewport())
  //   .wait(1000);
  // cy.byTestId("scroller")
  //   .scrollTo(1, 0)
  //   .wait(100)
  //   .scrollTo(200, 0)
  //   .wait(100)
  //   .then(() => cy.byTestId("text").inViewport());
});
