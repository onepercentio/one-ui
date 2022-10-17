import React, {
  CSSProperties,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/AnchoredTooltip/AnchoredTooltip.stories";
import { updateTooltipPosition } from "../../../../src/components/AnchoredTooltip/AnchoredTooltip";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});

describe.only("Improvement", () => {
  it("Should be able to reposition when the tooltip is born close to the borders", () => {
    cy.viewport(460, 800);
    function Wrapper(css: CSSProperties) {
      const tooltipRef = useRef<HTMLDivElement>(null);
      const anchorRef = useRef<HTMLButtonElement>(null);
      const [showTooltip, setShowTooltip] = useState(false);
      useLayoutEffect(() => {
        if (showTooltip)
          updateTooltipPosition(tooltipRef.current!, anchorRef.current!);
      }, [showTooltip]);
      return (
        <>
          <div style={{ position: "absolute", ...css }}>
            <button
              ref={anchorRef}
              onClick={() => {
                setShowTooltip(true);
              }}
            >
              Click me
            </button>
          </div>
          {showTooltip && (
            <div
              ref={tooltipRef}
              style={{ position: "absolute", whiteSpace: "nowrap" }}
            >
              Tooltip content
              <br />
              Line 1<br />
              Line 2<br />
              Line 3
            </div>
          )}
        </>
      );
    }
    /** This matches the collapsable test */
    cy.mount(
      <>
        <Wrapper {...{ top: 48, margin: 12, left: 48 }} />
        <Wrapper {...{ top: 48, margin: 12, right: 48 }} />
        <Wrapper {...{ bottom: 48, margin: 12, left: 48 }} />
        <Wrapper {...{ bottom: 48, margin: 12, right: 48 }} />
      </>
    ).wait(250);
    cy.get("button").eq(0).click().wait(1000);
    cy.get("button").eq(2).click().wait(1000);
  });
});
