import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "../../../../src/components/AnimatedEntrance/AnimatedEntrance.stories";
import * as AllExamples from "../../../../src/components/AnimatedEntrance/AnimatedEntrance.stories";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return mount(<Component {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({});
});

it.only("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === 'default') return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args}/>)
    cy.wait(500);
  }
})

it(`Should reveal a component
Should animate exiting of a component`, () => {
  mount(<Component />);
  for (let i = 0; i < 5; i++) cy.get("button").last().click();
  for (let i = 0; i < 5; i++) cy.contains(`Elemento ${i + 1}`);

  cy.wait(1000);

  cy.contains("Elemento 5").find("button").click();
  cy.contains("Elemento 8").find("button").click();
  cy.contains("Elemento 2").find("button").click();
  cy.contains("Elemento 1").find("button").click();
  cy.contains("Elemento 1").find("button").click({ force: true });
  cy.contains("Elemento 1").find("button").click({ force: true });

  cy.wait(1500);
  cy.contains("Elemento 7").find("button").click();
});
