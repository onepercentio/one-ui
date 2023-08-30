import React, { Fragment, ReactElement } from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "../../../../src/components/AnimatedEntrance/AnimatedEntrance.stories";
import * as AllExamples from "../../../../src/components/AnimatedEntrance/AnimatedEntrance.stories";
import AnimatedEntrance, {
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

it(`Should reveal a component
Should animate exiting of a component`, () => {
  mount(<Component />);
  for (let i = 0; i < 2; i++) cy.get("button").last().click();
  for (let i = 0; i < 2; i++) cy.contains(`Elemento ${i + 1}`);

  cy.wait(1000);

  cy.contains("Elemento 5").find("button").click();
});

it.only("Should animate an item enter and exiting", () => {
  const A = [
    <h1 key="1">First element</h1>,
    <h1 key="2">Second element</h1>,
    <h1 key="3">Third element</h1>,
  ];
  const B = [
    <h1 key="1">First element</h1>,
    <h1 key="2">Second element</h1>,
    <h1 key="3">Third element</h1>,
    <h1 key="4">Fourth element</h1>,
  ];
  cy.mountChain((children: ReactElement[]) => (
    <AnimatedEntrance>{children}</AnimatedEntrance>
  ))
    .remount(A)
    .wait(1200)
    .remount(B)
    .wait(500)
    .window()
    .then((w) => {
      w.console.clear();
    })
    .pause()
    .remount(A)
    .pause()
    .remount(B);
});

it("Should transition between elements out of order", () => {
  cy.mountChain((children: ReactElement[]) => (
    <AnimatedEntrance>{children}</AnimatedEntrance>
  ))
    .remount([
      <h1 key="1">First element</h1>,
      <h1 key="2">Second element</h1>,
      <h1 key="3">Third element</h1>,
      <h1 key="4">Fourth element</h1>,
      <h1 key="5">Fifth element</h1>,
    ])
    .wait(1500)
    .remount([
      <h1 key="1">First element</h1>,
      <h1 key="2">Second element</h1>,
      <h1 key="4v2">Fourth element</h1>,
      <h1 key="3">Third element</h1>,
      <h1 key="5">Fifth element</h1>,
    ])
    .wait(1500)
    .remount([
      <h1 key="1">First element</h1>,
      <h1 key="2">Second element</h1>,
      <h1 key="4v2">
        Fourth element
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
        <br />
        WITH A TON OF MORE CONTENT
      </h1>,
      <h1 key="3">Third element</h1>,
      <h1 key="5">Fifth element</h1>,
    ])
    .wait(1500)
    .remount([
      <h1 key="1">First element</h1>,
      <h1 key="2">Second element</h1>,
      <h1 key="3">Third element</h1>,
      <h1 key="4v3">Fourth element</h1>,
      <h1 key="5">Fifth element</h1>,
    ]);
});
