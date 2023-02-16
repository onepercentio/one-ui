import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Story } from "../../../../src/components/LavaLamp/LavaLamp.stories";
import Component from "../../../../src/components/LavaLamp/v2/LavaLamp";
import StoriesStyles from "../../../../src/components/LavaLamp/LavaLamp.stories.module.scss";

it.only("Should follow the mouse position", () => {
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
it("Should have random direction lava bubbles");
