import React from "react";
import { mount } from "cypress/react";

import Component from "../../../../src/components/PaginationIndicator/PaginationIndicator";

it("Should indicate pagination for a long number of pages", () => {
  const chain = cy.mountChain(() => {
    return <Component size={120} />;
  });
  chain.remount();
});
