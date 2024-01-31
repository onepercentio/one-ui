/// <reference types="cypress" />
import "@muritavo/cypress-toolkit/dist/support/essentials";
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
declare global {
  namespace Cypress {
    interface Chainable {
      needsMetamask(): Cypress.Chainable<void>;
    }
  }
}

beforeEach(() => {
  const w = window.parent;
  const style = w.document.createElement("style");
  style.innerHTML = `.collapsible-content ul {
        display: flex;
        flex-direction: column-reverse;
    }
    `;
  w.document.head.appendChild(style);
});

Cypress.Commands.add("needsMetamask", () => {
  cy.window().then((w) => {
    if (!w.ethereum)
      throw new Error(
        `This test requires metamask to be installed and configured.`
      );
  });
});
