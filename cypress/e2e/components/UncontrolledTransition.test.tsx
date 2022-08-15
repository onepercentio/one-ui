import { mount, MountReturn } from "cypress/react";
import React, {
  createRef,
  CSSProperties,
  ElementRef,
  Fragment,
  ReactElement,
  useEffect,
  useState,
} from "react";
import { TransitionAnimationTypes } from "../../../src/components/Transition";
import Comp from "../../../src/components/UncontrolledTransition";
import TestAnimation from "../../component/TestAnimation";

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

it("Should change correctly", () => {
  let UncontrolledTransition = createRef<ElementRef<typeof Comp>>();
  const c = cy.mountChain((children: ReactElement) => (
    <Comp ref={UncontrolledTransition}>{children}</Comp>
  ));
  c.remount(<h1 key="first_render">First Render</h1>).wait(25);
  cy.then(() => UncontrolledTransition.current.setOrientation("backward"));
  c.remount(<h1 key="second_render">Second Render</h1>).wait(25);
  cy.then(() => UncontrolledTransition.current.setOrientation("backward"));
  c.remount(<h1 key="Third_render">Third Render</h1>).wait(25);
  cy.then(() => UncontrolledTransition.current.setOrientation("backward"));
  c.remount(<h1 key="Fourfth_render">Fourfth Render</h1>).wait(25);
  cy.then(() => UncontrolledTransition.current.setOrientation("backward"));
  c.remount(<h1 key="Fifth_render">Fifth Render</h1>).wait(25);
  cy.then(() => UncontrolledTransition.current.setOrientation("backward"));
  c.remount(<Fragment key={"first_render-nullated"} />).wait(100);
});
describe("BUGFIX", () => {
  it("Should not skip an animation when going back", () => {
    const ref = createRef<ElementRef<typeof Comp>>();
    function T() {
      const [s, ss] = useState(false);

      useEffect(() => {
        setInterval(() => {
          ss(true);
        }, 1000);
      }, []);

      return (
        <div
          style={
            {
              "--animation-speed-transition": "3s",
              backgroundColor: "blue",
            } as any
          }
        >
          <Comp>{s ? <h1 key="1">End</h1> : <h1 key="2">Start</h1>}</Comp>
        </div>
      );
    }
    const chain = cy.mountChain((children: ReactElement) => {
      return (
        <div style={{ "--animation-speed-transition": "5s" } as any}>
          <Comp ref={ref}>{children}</Comp>
        </div>
      );
    });
    chain.remount(<h1 key="h1">Something</h1>).wait(1000);
    cy.then(() => {
      ref.current!.setOrientation("backward");
    });
    chain.remount(
      <h2 key="h2">
        Another thing
        <br />
        <TestAnimation />
        <T />
      </h2>
    );
  });
  it("Should end correctly when it's too fast", () => {
    const chain = cy.mountChain((children: ReactElement) => {
      return <Comp>{children}</Comp>;
    });
    chain.remount(<React.Fragment key={"first1"}>First</React.Fragment>);
    chain.remount(<React.Fragment key={"Second2"}>Second</React.Fragment>);
    chain.remount(<React.Fragment key={"Third3"}>Third</React.Fragment>);
    chain.remount(<React.Fragment key={"Second4"}>Second</React.Fragment>);
    chain.remount(<React.Fragment key={"first5"}>First</React.Fragment>);
    cy.get("section").should("have.text", "First");
  });
  it("Should clean all classes when finishing animation", () => {
    const chain = cy.mountChain((title: string, screen: number) => {
      return (
        <>
          <h1>
            {title}: {screen}
          </h1>
          <Comp transitionType={TransitionAnimationTypes.POP_FROM_CLICK_ORIGIN}>
            {screen === 0 ? (
              <React.Fragment key={"first1"}>First</React.Fragment>
            ) : (
              <React.Fragment key={"second1"}>Second {title}</React.Fragment>
            )}
          </Comp>
        </>
      );
    });
    chain.remount("Primeiro render", 0).wait(1000);
    chain.remount("Segundo render", 1).wait(1000);
    chain.remount("Terceiro render", 1).wait(1000);
    chain.remount("Quarto render", 1).wait(1000);
  });
});
