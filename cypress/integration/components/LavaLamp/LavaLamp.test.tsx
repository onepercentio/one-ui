import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Story } from "../../../../src/components/LavaLamp/LavaLamp.stories";
import Component from "../../../../src/components/LavaLamp/v2/LavaLamp";
import StoriesStyles from "../../../../src/components/LavaLamp/LavaLamp.stories.module.scss";

it("Should follow the mouse position", () => {
  cy.viewport(1920, 1080 * 2);
  cy.mountChain(() => (
    <>
      <Story />
      <Component className={StoriesStyles.container}>
        <h1>Some example</h1>
      </Component>
    </>
  )).remount();
});
describe("FEATURE", () => {
  it.only("Should replace guide by an auto when mouse leave", () => {
    const chain = cy.mountChain(() => (
      <Component
        key={Math.random()}
        className={StoriesStyles.relativeContainer}
      >
        <h1>Some example</h1>
      </Component>
    ));

    cy.viewport(1920 * 2, 1080 * 2);
    chain.remount().wait(2000);
  });
});
describe("BUGFIX", () => {
  it("Should have speed relative to the canvas viewport", () => {
    const chain = cy.mountChain(() => (
      <Component
        key={Math.random()}
        className={StoriesStyles.relativeContainer}
      >
        <h1>Some example</h1>
      </Component>
    ));
    cy.viewport(1920 / 4, 1080 / 4);
    chain.remount().wait(2000);

    cy.viewport(1920 * 2, 1080 * 2);
    chain.remount().wait(2000);
  });
});
