import React, { useEffect } from "react";
import { mount } from "cypress/react";
import * as AllExamples from "../../../../src/components/Transition/Transition.stories";
import Transition, {
  TransitionAnimationTypes,
} from "../../../../src/components/Transition";

it("All examples mount at least", () => {
  for (let ExampleName in AllExamples) {
    if (ExampleName === "default") return;
    const Example = AllExamples[ExampleName];
    mount(<Example {...Example.args} />);
    cy.wait(500);
  }
});
it.only("Should not remount when switching screens", () => {
  const builder1 = cy.spy(() => {
    alert("************ BUILDING 1");
  });
  const builder2 = cy.spy(() => {
    alert("************ BUILDING 2");
  });
  function ScreenA() {
    useEffect(builder1, []);
    return <h1>Screen A</h1>;
  }
  function ScreenB() {
    useEffect(builder2, []);
    return <h1>Screen B</h1>;
  }

  const mounter = cy
    .mountChain((step: number) => {
      return (
        <Transition transitionType={TransitionAnimationTypes.FADE} step={step}>
          <ScreenA key={"x"} />
          <ScreenB key={"y"} />
        </Transition>
      );
    })
    .remount(0);
  cy.wait(1000).then(() => {
    expect(builder1).to.be.calledOnce;
    expect(builder2).to.not.be.called;
  });

  mounter.remount(1);
  cy.wait(1000).then(() => {
    expect(builder1).to.be.calledOnce;
    expect(builder2).to.be.calledOnce;
  });
});
