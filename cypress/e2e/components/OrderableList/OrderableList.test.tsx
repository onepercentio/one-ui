import React from "react";
import { mount } from "cypress/react";

import * as AllExamples from "../../../../src/components/OrderableList/OrderableList.stories";
/**
 * Emulates the focus
 * @param whichOne
 */
function focusDrag(whichOne: number) {
  cy.byTestId(`click`)
    .eq(whichOne - 1)
    .trigger("mousedown");
  cy.byTestId("orderable-list-clone");
}
/**
 * Emulates dragging from the anchor to another
 */
function dragEl(ofWhich: number, to: "start" | "middle" | "end") {
  return cy
    .get("section")
    .eq(ofWhich - 1)
    .then((e) => {
      const el = e.get(0);
      cy.wrap(el).trigger("mousemove", {
        offsetY:
          to === "middle"
            ? el.clientHeight / 2
            : to === "end"
            ? el.clientHeight * 0.95
            : el.clientHeight * 0.05,
      });
    })
    .wait(1500).realMouseUp();
}
it("Should be able to show the items", () => {
  cy.mount(<AllExamples.InitialImplementation />);
});
it("Should be able to show the items on a different order", () => {
  cy.mount(
    <AllExamples.InitialImplementation keyOrder={["5", "3", "1", "2", "4"]} />
  );
});
it.only("Should animate correctly", () => {
  cy.viewport(1920, 2160);
  cy.mount(<AllExamples.InitialImplementation />);

  focusDrag(1);
  dragEl(3, "start").wait(1500);

  focusDrag(2);
  dragEl(1, "start").wait(1500);

  // focusDrag(2);
  // dragEl(1, "start").wait(1500);
});
it("Should animate the item repositioning when moving it", () => {
  cy.viewport(1920, 2160);
  cy.mount(<AllExamples.InitialImplementation />);
  cy.get("h1").eq(3).children().eq(0).realMouseDown({
    position: "center",
  });

  function switchPlaces(sideA: number, sideB: number, expect: string) {
    const dir = sideA > sideB ? "start" : "end";
    focusDrag(sideA);
    dragEl(sideB, dir).wait(1500);
    cy.get("body").should("include.text", expect);
    const dir2 = sideB > sideA ? "start" : "end";
    focusDrag(sideB);
    dragEl(sideA, dir2).wait(1500);
    cy.get("body").should("include.text", "1 2 3 4 5");
  }

  focusDrag(1);
  dragEl(3, "start").wait(1500);
  cy.get("body").should("include.text", "2 1 3 4 5");
  focusDrag(2);
  dragEl(1, "start").wait(1500);
  cy.get("body").should("include.text", "1 2 3 4 5");

  // Forward
  switchPlaces(1, 5, "2 3 4 5 1");
  // Backwards
  switchPlaces(3, 2, "1 3 2 4 5");
  // Forward
  switchPlaces(1, 2, "2 1 3 4 5");
  // Backwards
  switchPlaces(5, 4, "1 2 3 5 4");
});
