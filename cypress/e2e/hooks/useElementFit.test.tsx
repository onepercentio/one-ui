import React from "react";
import { mount } from "cypress/react";
import useFit from "../../../src/hooks/useElementFit";
import useElementFit from "../../../src/hooks/useElementFit";
function Wrapper({ mode }: { mode: "h" | "v" }) {
  const { itemsToShow, ref } = useElementFit(
    400,
    mode === "h" ? undefined : 300
  );
  return (
    <div
      ref={ref}
      style={{
        width: "100vw",
        height: "100vh",
        maxHeight: "1080px",
        backgroundColor: "red",
        display: "flex",
        overflow: "auto",
        flexWrap: "wrap"
      }}
    >
      {new Array(itemsToShow).fill(
        <div
          style={{
            height: 300,
            maxWidth: 400,
            width: "100%",
            background: "linear-gradient(to right, green, yellow)",
            borderTop: "4px solid black"
          }}
          data-testid="element"
        />
      )}
    </div>
  );
}
it("Should be able to fit elements horizontally", () => {
  for (let [w, h, howMuch] of [
    [2480, 1080, 6],
    [320, 640, 1],
  ]) {
    cy.viewport(w, h);
    mount(<Wrapper mode="h" />);
    cy.byTestId("element").should("have.length", howMuch).wait(1000);
  }
});

it("Should be able to fit elements considering horizontal height", () => {
  for (let [w, h, howMuch] of [
    [2480, 1080 * 3, 6 * 4],
    [320, 640, 3],
  ]) {
    cy.viewport(w, h);
    mount(<Wrapper mode="v" />);
    cy.byTestId("element").should("have.length", howMuch).wait(1000);
  }
});
