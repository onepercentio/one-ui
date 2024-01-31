import React, { Fragment, useEffect, useRef } from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/AdaptiveContainer/AdaptiveContainer.stories";
import AdaptiveContainer from "components/AdaptiveContainer/AdaptiveContainer";
import { randomColor } from "../../../utility/color";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

it.only("Should transition correctly", () => {
  const chain = cy.mountChain((height: number) => {
    return (
      <AdaptiveContainer direction="v">
        <Fragment key={`${height}`}>
          <div
            style={{
              width: "100%",
              height: `${height}px`,
              backgroundColor: randomColor(height + "px"),
            }}
          />
        </Fragment>
      </AdaptiveContainer>
    );
  });
  chain.remount(200).pause().wait(1000).remount(600);
});
