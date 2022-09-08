import React, { useState } from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Collapsable/Collapsable.stories";
import AdaptiveDialog from "../../../../src/components/AdaptiveDialog";
import Button from "../../../../src/components/Button";
import Collapsable from "../../../../src/components/Collapsable";

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
});
