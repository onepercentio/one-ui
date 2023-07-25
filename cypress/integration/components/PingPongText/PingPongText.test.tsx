import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "components/PingPongText/PingPongText.stories";

it("Should be able to go to end and back to start over a overflow text", () => {
  cy.viewport(500, 500);
  mount(<Component />);
});
