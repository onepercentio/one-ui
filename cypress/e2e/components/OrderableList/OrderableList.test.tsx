import React, { useEffect, useState } from "react";
import { mount } from "cypress/react";

import Comp, {
  OrderableListReorderMode,
  useOrderableListAnchor,
} from "../../../../src/components/OrderableList/OrderableList";
import * as AllExamples from "../../../../src/components/OrderableList/OrderableList.stories";
import MutableHamburgerButton from "../../../../src/components/MutableHamburgerButton";
import Styles from "./OrderableList.module.scss";

/**
 * Emulates the focus
 * @param whichOne
 */
function focusDrag(whichOne: number) {
  cy.byTestId(`click`)
    .eq(whichOne - 1)
    .trigger("mousedown");
  cy.byTestId("orderable-list-clone");
}
/**
 * Emulates dragging from the anchor to another
 */
function dragEl(ofWhich: number, to: "start" | "middle" | "end") {
  return cy
    .get("section")
    .eq(ofWhich - 1)
    .then((e) => {
      const el = e.get(0);
      cy.wrap(el).trigger("mousemove", {
        offsetY:
          to === "middle"
            ? el.clientHeight / 2
            : to === "end"
            ? el.clientHeight * 0.95
            : el.clientHeight * 0.05,
      });
    })
    .wait(500)
    .realMouseUp();
}
it("Should be able to show the items", () => {
  cy.mount(<AllExamples.InitialImplementation />);
});
it("Should be able to show the items on a different order", () => {
  cy.mount(
    <AllExamples.InitialImplementation keyOrder={["5", "3", "1", "2", "4"]} />
  );
});
it("Should animate correctly", () => {
  cy.viewport(1920, 2160);
  cy.mount(<AllExamples.InitialImplementation />);

  focusDrag(1);
  dragEl(3, "start").wait(1500);

  focusDrag(2);
  dragEl(1, "start").wait(1500);

  // focusDrag(2);
  // dragEl(1, "start").wait(1500);
});
it("Should animate the item repositioning when moving it", () => {
  cy.viewport(1920, 2160);
  cy.mount(<AllExamples.InitialImplementation />);
  cy.get("h1").eq(3).children().eq(0).realMouseDown({
    position: "center",
  });

  function switchPlaces(sideA: number, sideB: number, expect: string) {
    const dir = sideA > sideB ? "start" : "end";
    focusDrag(sideA);
    dragEl(sideB, dir).wait(1500);
    cy.get("body").should("include.text", expect);
    const dir2 = sideB > sideA ? "start" : "end";
    focusDrag(sideB);
    dragEl(sideA, dir2).wait(1500);
    cy.get("body").should("include.text", "1 2 3 4 5");
  }

  focusDrag(1);
  dragEl(3, "start").wait(1500);
  cy.get("body").should("include.text", "2 1 3 4 5");
  focusDrag(2);
  dragEl(1, "start").wait(1500);
  cy.get("body").should("include.text", "1 2 3 4 5");

  // Forward
  switchPlaces(1, 5, "2 3 4 5 1");
  // Backwards
  switchPlaces(3, 2, "1 3 2 4 5");
  // Forward
  switchPlaces(1, 2, "2 1 3 4 5");
  // Backwards
  switchPlaces(5, 4, "1 2 3 5 4");
});
it("Should work with variable height elements", () => {
  cy.viewport(1920, 1080 * 1.6);
  function Wrapper({ i }: { i: number }) {
    const { anchorRef } = useOrderableListAnchor();
    return (
      <>
        <div
          ref={anchorRef}
          style={{
            display: "inline-block",
          }}
          data-testid={`click`}
        >
          <MutableHamburgerButton size={24} />
        </div>
      </>
    );
  }

  function VariableWrapper({ i }: { i: number }) {
    const [height, setHeight] = useState(100);

    useEffect(() => {
      setTimeout(() => {
        setHeight(300);
      }, 500);
    }, []);
    return (
      <div
        style={{
          height,
          fontSize: height * 0.8,
          fontWeight: "bold",
          lineHeight: `${height}px`,
          opacity: 0.3,
          background: "linear-gradient(to right, red, green, blue)",
        }}
      >
        <Wrapper i={i} />
        {i} - {height}
      </div>
    );
  }
  cy.mount(
    <Comp onChangeKeyOrder={() => {}}>
      <VariableWrapper key={"1"} i={1} />
      <VariableWrapper key={"2"} i={2} />
      <VariableWrapper key={"3"} i={3} />
      <VariableWrapper key={"4"} i={4} />
      <VariableWrapper key={"5"} i={5} />
    </Comp>
  ).wait(700);

  focusDrag(5);
  dragEl(2, "start").wait(1500);
});
function gridRender() {
  const chain = cy.mountChain((currentOrder: number[]) => {
    const els = currentOrder.map((i) =>
      new Intl.NumberFormat(undefined, {
        minimumIntegerDigits: 4,
      }).format(i)
    );
    return (
      <Comp
        className={Styles.root}
        onChangeKeyOrder={() => {}}
        currentOrder={els}
        mode={OrderableListReorderMode.TWO_DIMENSIONS}
      >
        {els.map((fo) => (
          <div
            key={fo}
            style={{
              background: "linear-gradient(red, green, blue)",
              height: 100,
              width: 100,
              fontSize: 25,
              lineHeight: "100px",
              verticalAlign: "middle",
              textAlign: "center",
              color: "white",
            }}
          >
            {fo}
          </div>
        ))}
      </Comp>
    );
  });
  return chain;
}
it("Should be able to transition ordered elements", () => {
  cy.viewport(1366, 768);
  const order1 = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const order2 = [1, 2, 4, 3, 5, 6, 7, 8, 9];
  const order3 = [1, 2, 4, 3, 6, 7, 8, 9];
  const order4 = [1, 4, 3, 6, 7, 8, 9];
  const order5 = [1, 9, 3, 6, 7, 8, 4];
  gridRender()
    .remount([...order1, ...order1.map((a) => a + 10)])
    .wait(1000)
    .remount([...order2, ...order2.map((a) => a + 10)])
    .wait(1000)
    .remount([...order3, ...order3.map((a) => a + 10)])
    .wait(1000)
    .remount([...order4, ...order4.map((a) => a + 10)])
    .wait(1000)
    .remount([...order5, ...order5.map((a) => a + 10)]);
});
it("Should be able to transition grid elements", () => {
  cy.viewport(300, 800);
  const all = new Array(20).fill(undefined).map((_, i) => i);

  const evenOnly = all.filter((a) => Number(a) % 2 === 0);
  const oddOnly = all.filter((a) => Number(a) % 2 !== 0);
  const tripleOnly = all.filter((a) => Number(a) % 3 === 0);

  gridRender()
    .remount(all)
    .wait(1000)
    .remount(evenOnly)
    .wait(1000)
    .remount(all)
    .wait(1000)
    .remount(oddOnly)
    .wait(1000)
    .remount(all)
    .wait(1000)
    .remount(tripleOnly)
    .wait(1000)
    .remount(all);
});

describe.only("BUGFIX", () => {
  it("Should not hide unlisted elements", () => {
    function c(key: string) {
      return <p key={key}>{key}</p>;
    }
    cy.mount(
      <Comp keyOrder={["1", "2", "3"].reverse()}>
        {[c("1"), c("2"), c("3"), c("4"), c("5")]}
      </Comp>
    );

    cy.get("div").contains("32145");
  });
});
