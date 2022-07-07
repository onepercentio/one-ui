import { mount } from "cypress/react";
import { useHistory, useLocation } from "react-router-dom";
import C from "../../../src/context/CustomBrowserRouter";
import useC from "../../../src/hooks/useCustomHistory";

function Comp() {
  const h = useHistory();
  const location = useLocation();
  const ch = useC();

  return (
    <>
      <h1>Current route {location.pathname}</h1>
      <button onClick={() => h.push("/some-route")}>go to route</button>
      <button onClick={() => ch.goBackWithFallback("/fallbackroute")}>
        go back
      </button>
      <button onClick={() => h.replace("/another-route")}>replace</button>
    </>
  );
}
it("Should render with 1 previous route", () => {
  mount(
    <C>
      <Comp />
    </C>
  );
  let initialPathName!: string;
  cy.window()
    .its("history")
    .should("have.property", "state")
    .should("be.null")
    .then(() => {
      initialPathName = location.pathname;
    });
  cy.contains("go to route").click();
  cy.window()
    .its("history")
    .should("have.property", "state")
    .should("have.property", "state")
    .should("have.deep.property", "internalNavigation", true);

  cy.contains("go back")
    .click()
    .then(() => {
      expect(location.pathname).to.eq(initialPathName);
    });
});
it("Should go to fallback route when there is no back route defined", () => {
  mount(
    <C>
      <Comp />
    </C>
  );
  cy.contains("go back")
    .click()
    .then(() => expect(location.pathname).to.eq("/fallbackroute"));
});
// HISTORY IS SHARED BETWEEN TESTS (GOOD PRACTICES FOR TESTING? Where are they?) so the history is poluted, use .only when running this test
it.skip("Should not change state when replacing", () => {
  mount(
    <C>
      <Comp />
    </C>
  );
  cy.window().its("history").should("have.property", "state").should("be.null");

  cy.contains("replace").click();

  cy.window()
    .its("history")
    .should("have.property", "state")
    .should("have.property", "state")
    .should("be.undefined");

  cy.contains("go to route").click();
  cy.window()
    .its("history")
    .should("have.property", "state")
    .should("have.property", "state")
    .should("have.deep.property", "internalNavigation", true);

  cy.contains("replace").click();
  cy.window()
    .its("history")
    .should("have.property", "state")
    .should("have.property", "state")
    .should("have.deep.property", "internalNavigation", true);

  cy.contains("go back").click();
  cy.contains("go back").click();
  cy.window()
    .its("history")
    .should("have.property", "state")
    .should("have.property", "state")
    .should("be.undefined");
});
