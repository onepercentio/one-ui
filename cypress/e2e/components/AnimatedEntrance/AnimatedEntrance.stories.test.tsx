import React, { Fragment, ReactElement } from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "../../../../src/components/AnimatedEntrance/AnimatedEntrance.stories";
import * as AllExamples from "../../../../src/components/AnimatedEntrance/AnimatedEntrance.stories";
import {
  AnimatedEntranceItem,
  EntranceType,
} from "../../../../src/components/AnimatedEntrance/AnimatedEntrance";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return mount(<Component {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({});
});

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

it("Should exit correctly", () => {
  const cb = cy.spy();
  cy.mountChain((children: ReactElement, disableAnimation: boolean) => (
    <AnimatedEntranceItem
      noEntranceAnimation={disableAnimation}
      onRemoveChildren={cb}
      entranceType={EntranceType.SLIDE_AND_EXPAND}
    >
      {children}
    </AnimatedEntranceItem>
  ))
    .remount(<h1 key="first_render">First render</h1>, true)
    .wait(1000)
    .remount(<Fragment key={"first_render-nullated"} />, false);
});

it.only(`Should reveal a component
Should animate exiting of a component`, () => {
  mount(<Component />);
  for (let i = 0; i < 2; i++) cy.get("button").last().click();
  for (let i = 0; i < 2; i++) cy.contains(`Elemento ${i + 1}`);

  cy.wait(1000);

  cy.contains("Elemento 5").find("button").click();
  // cy.contains("Elemento 8").find("button").click();
  // cy.contains("Elemento 2").find("button").click();
  // cy.contains("Elemento 1").find("button").click();
  // cy.contains("Elemento 1").find("button").click({ force: true });
  // cy.contains("Elemento 1").find("button").click({ force: true });

  // cy.wait(1500);
  // cy.contains("Elemento 7").find("button").click();
});
