import React, { CSSProperties, ForwardedRef, forwardRef } from "react";
import { mount } from "cypress/react";
import useContained from "../../../src/hooks/useContainedRepositioning";

const squareStyle: CSSProperties = {
  height: "180px",
  width: "350px",
  backgroundColor: "black",
  fontSize: "150px",
  color: "white",
  textAlign: "center",
  position: "relative",
  transition: "right",
  transitionDuration: "100ms",
  border: "1px solid white",
};

function _Square({ num }: { num: string }, ref: ForwardedRef<HTMLDivElement>) {
  return (
    <div data-testid="square" ref={ref} style={squareStyle}>
      {num}
    </div>
  );
}
const Square = forwardRef(_Square);

function Wrapper({ elToFocus }: { elToFocus?: number }) {
  const { elementToCheck } = useContained(
    elToFocus !== undefined,
    (el) => el.parentElement!.parentElement!
  );
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        backgroundColor: "yellow",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        data-testid="scroller"
        style={{
          background: "linear-gradient(to right, red, green, blue)",
          height: "200px",
          width: "100vw",
          minWidth: "100vw",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          style={{
            width: 1920 * 3,
            minWidth: 1920 * 3,
            display: "flex",
            justifyContent: "space-around",
          }}
        >
          {new Array(11).fill(undefined).map((_a, i) => (
            <Square
              ref={i === elToFocus ? elementToCheck : undefined}
              num={i.toString()}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

it("Should be able to bring an element upfront", () => {
  const indexesNotNeedingOverflow = [4, 5, 6];
  const chain = cy.mountChain((elToFocus?: number) => (
    <Wrapper elToFocus={elToFocus} />
  ));

  chain
    .remount()
    .then(() => cy.byTestId("scroller").scrollTo("center"))
    .wait(1000);

  cy.byTestId("square").then((els) => {
    for (let whichIndex of [7, 3, ...indexesNotNeedingOverflow, 0])
      cy.wrap(`Moving ${whichIndex}`).then(() => {
        chain
          .remount(whichIndex)
          .waitUntil(() => {
            if (indexesNotNeedingOverflow.includes(whichIndex)) return true;
            return els.get(whichIndex).style.zIndex === "1000";
          })
          .wait(1000)
          .remount()
          .waitUntil(() => !!els.get(whichIndex).style.zIndex)
          .wait(1000);
      });
  });
});

it.only("Should be able to move on mobile", () => {
  const chain = cy.mountChain((elToFocus?: number) => (
    <Wrapper elToFocus={elToFocus} />
  ));
  const t = 1000;

  for (let [w, h, offset] of [
    [360, 640, 120],
    [1920, 1080, 1920 / 2 + 120],
  ]) {
    cy.viewport(w, h);
    chain.remount();
    cy.byTestId("scroller")
      .scrollTo(1920 * 1.5 - w / 2 + offset, 0)
      .wait(t);

    chain.remount(5).wait(t);
    chain.remount().wait(t);

    cy.byTestId("scroller")
      .scrollTo(1920 * 1.5 - w / 2 - offset, 0)
      .wait(t);

    chain.remount(5).wait(t).remount();
  }
});
