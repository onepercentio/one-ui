import { mount, MountReturn } from "cypress/react";
import React, { createRef, CSSProperties, ElementRef, Fragment } from "react";
import Comp from "../../../src/components/UncontrolledTransition";

const animationDuration = 2000;

const overrideStyle: CSSProperties = {
  animationDuration: animationDuration ? `${animationDuration}ms` : undefined,
};

it("Should change between screens", () => {
  const ref = createRef<ElementRef<typeof Comp>>();
  mount(
    <Comp contentStyle={overrideStyle} ref={ref}>
      <h1 key="first">First render</h1>
    </Comp>
  )
    .wait(2000)
    .then((r) => {
      r.rerender(
        <Comp contentStyle={overrideStyle} ref={ref}>
          <h1 key="second">Second render</h1>
        </Comp>
      )
        .wait(animationDuration + 1000)
        .then(() => {
          ref.current?.setOrientation("backward");
          r.rerender(
            <Comp contentStyle={overrideStyle} ref={ref}>
              <h1 key="first">First render</h1>
            </Comp>
          );
        })
        .wait(animationDuration);
    });
});
it("Should be able to update current content", () => {
  let mountReturn!: MountReturn;
  let UncontrolledTransition = createRef<ElementRef<typeof Comp>>();
  mount(
    <Comp contentStyle={overrideStyle} ref={UncontrolledTransition}>
      <h1 key="first">First render</h1>
    </Comp>
  )
    .wait(500)
    .then((r) => {
      mountReturn = r;
      cy.get("body").contains("First render");
      r.rerender(
        <Comp contentStyle={overrideStyle} ref={UncontrolledTransition}>
          <h1 key="first">First render with updated content</h1>
        </Comp>
      )
        .wait(500)
        .get("body")
        .contains("First render with updated content");
      r.rerender(
        <Comp contentStyle={overrideStyle} ref={UncontrolledTransition}>
          <h1 key="second">Second screen</h1>
        </Comp>
      )
        // .wait(50)
        // .then(() => {
        //   cy.get("body").should(
        //     "have.text",
        //     "First render with updated contentSecond screen"
        //   );
        // })
        .wait(animationDuration + 500)
        .get("body")
        .contains("Second screen");

      return r
        .rerender(
          <Comp contentStyle={overrideStyle} ref={UncontrolledTransition}>
            <h1 key="second">Second screen with updated content</h1>
          </Comp>
        )
        .wait(animationDuration + 500)
        .get("body")
        .contains("Second screen with updated content");
    })
    .then(() => {
      UncontrolledTransition.current!.setOrientation("backward");
      mountReturn.rerender(
        <Comp contentStyle={overrideStyle} ref={UncontrolledTransition}>
          <h1 key="first">Back to first screen</h1>
        </Comp>
      );
    })
    .wait(animationDuration);
});

it("Faster than animation", () => {
  const animationDuration = 3000;

  const overrideStyle: CSSProperties = {
    animationDuration: animationDuration ? `${animationDuration}ms` : undefined,
  };

  let mountReturn!: MountReturn;
  let UncontrolledTransition = createRef<ElementRef<typeof Comp>>();
  function r(key: string, content: string, backward?: boolean) {
    if (backward) UncontrolledTransition.current!.setOrientation("backward");
    mountReturn
      .rerender(
        <div
          style={{
            marginLeft: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "red",
            maxWidth: "10vw",
            overflow: "visible",
          }}
        >
          <Comp contentStyle={overrideStyle} ref={UncontrolledTransition}>
            <h1 key={key}>{content}</h1>
          </Comp>
        </div>
      )
      .wait(animationDuration * 0.25);
  }
  mount(<Fragment />)
    .then((r) => (mountReturn = r))
    .then(() => r("First", "Screen 1"))
    .then(() => r("First", "Screen 1 with update"))
    .then(() => r("Second", "Screen 2 initial"))
    .then(() => r("Second", "Screen 2 updated"))
    .then(() => r("Third", "Screen 3"))
    .then(() => r("Third", "Screen 3 with update"))
    .then(() => r("Fourth", "Screen 4"))
    .then(() => r("Fourth", "Screen 4 with update"))
    .then(() => r("Fifth", "Screen 5"))
    .then(() => r("Fifth", "Screen 5 with update"))
    .then(() => r("First", "Screen 1 back to initial", true))
    .wait(animationDuration);
});
