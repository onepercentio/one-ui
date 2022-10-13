import React, { CSSProperties, useLayoutEffect, useRef, useState } from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Collapsable/Collapsable.stories";
import AdaptiveDialog from "../../../../src/components/AdaptiveDialog";
import Button from "../../../../src/components/Button";
import Collapsable from "../../../../src/components/Collapsable";
import { updateTooltipPosition } from "../../../../src/components/AnchoredTooltip/AnchoredTooltip";
import Styles from "./Collapsable.test.module.scss";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

function Wrapper() {
  const [o, so] = useState(false);
  const [o2, so2] = useState(false);
  return (
    <>
      <AdaptiveDialog open={o} onClickOut={() => so(false)}>
        Something
      </AdaptiveDialog>
      <Button onClick={() => so(true)}>Open dialog</Button>
      <Collapsable
        onToggleOpen={(o) => so2(o)}
        open={o2}
        title={<Button>Open collapsable</Button>}
      >
        <>Something more</>
      </Collapsable>
    </>
  );
}

describe.only("BUGFIX", () => {
  it("Should not have conflict with adaptive dialog?", () => {
    mount(
      <>
        <Wrapper />
      </>
    );
  });

  it.only("Should be able to open the toolitp on bottom", () => {
    cy.viewport(460, 800);
    function Wrapper(css: CSSProperties) {
      const [showTooltip, setShowTooltip] = useState(false);
      return (
        <>
          <div
            style={{
              position: "absolute",
              ...css,
            }}
          >
            <Collapsable
              open={showTooltip}
              onToggleOpen={(o) => setShowTooltip(o)}
              title={<button>Click me</button>}
              className={Styles.collapsable}
              mode={"float"}
            >
              Tooltip content
              <br />
              Line 1<br />
              Line 2<br />
              Line 3
            </Collapsable>
          </div>
        </>
      );
    }
    cy.mount(
      <>
        <Wrapper {...{ top: 48, left: 48 }} />
        <Wrapper {...{ top: 48, right: 48 }} />
        <Wrapper {...{ bottom: 48, left: 48 }} />
        <Wrapper {...{ bottom: 48, right: 48 }} />
      </>
    ).wait(250);
    cy.get("button").eq(0).click().wait(1000);
    cy.get("button").eq(2).click().wait(1000);
  });
});
