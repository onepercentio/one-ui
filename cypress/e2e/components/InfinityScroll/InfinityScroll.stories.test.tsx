import React from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/InfinityScroll/InfinityScroll.stories";
import Component, {
  getItemsFactory,
  InfinityDataTestId,
} from "../../../../src/components/InfinityScroll/InfinityScroll";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

function Sample({ i }: { i: number }) {
  function r(i: number, e: number) {
    return i % 3 === e ? 255 : 0;
  }
  return (
    <h1
      style={{
        display: "inline-block",
        width: "23vw",
        margin: "0px 5vw",
        backgroundColor: `rgb(${r(i, 0)}, ${r(i, 1)}, ${r(i, 2)})`,
        fontSize: "80px",
        lineHeight: "100px",
        color: "white",
        textAlign: "center",
      }}
    >
      {i}
    </h1>
  );
}

describe("BUGFIX", () => {
  function scrollAndExpect(to: string, direction: "f" | "b" = "b") {
    alert("Scrolling to " + (1920 - (direction === "b" ? 1920 : -1920)));
    cy.byTestId(InfinityDataTestId.ROOT)
      .scrollTo(1920 - (direction === "b" ? 1920 : -1920), 0, {})
      .wait(150);
    cy.byTestId(InfinityDataTestId.ROOT).should("have.text", to);
  }
  it("Should not lose order when scrolling pages", () => {
    const amount = new Array(10)
      .fill(undefined)
      .map((_, i) => <Sample i={i} />);
    cy.mount(
      <div data-testid="container">
        <Component items={amount} pageSize={3} />
      </div>
    );
    cy.wait(500);
    cy.byTestId(InfinityDataTestId.ROOT).should("have.text", "789012345");

    for (let i of new Array(10)) {
      scrollAndExpect("456789012");
      scrollAndExpect("123456789");
      scrollAndExpect("890123456");
      scrollAndExpect("567890123");
      scrollAndExpect("234567890");
      scrollAndExpect("901234567");
      scrollAndExpect("678901234");
      scrollAndExpect("345678901");
      scrollAndExpect("012345678");
      scrollAndExpect("789012345");
    }
  });
  it.each.only(
    [
      [
        2,
        7,
        [
          "560123",
          "345601",
          "123456",
          "601234",
          "456012",
          "234560",
          "012345",
          "560123",
        ],
        "backward",
      ],
    ] as [
      pageSize: number,
      itemsAmount: number,
      cenariosLoop: string[],
      direction: "forward" | "backward"
    ][],
    "Should not lose order for these cenarios",
    ([pageSize, _amount, [startingCenario, ...cenarios], direction]) => {
      const amount = new Array(_amount)
        .fill(undefined)
        .map((_, i) => <Sample i={i} />);
      cy.mount(
        <div data-testid="container">
          <Component items={amount} pageSize={pageSize} />
        </div>
      ).wait(1000);
      cy.byTestId(InfinityDataTestId.ROOT).should("have.text", startingCenario);
      for (let _ of new Array(_amount)) {
        for (let cenario of cenarios)
          if (direction === "backward") scrollAndExpect(cenario);
      }

      const reverse = [...cenarios].reverse();
      scrollAndExpect(cenarios[0]);
      for (let _ of new Array(_amount)) {
        for (let cenario of reverse)
          if (direction === "backward") scrollAndExpect(cenario, "f");
      }
    }
  );
});
