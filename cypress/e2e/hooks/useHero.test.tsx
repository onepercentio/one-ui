import { CSSProperties, Fragment } from "react";
import { TransitionAnimationTypes } from "../../../src/components/Transition";
import UncontrolledTransition from "../../../src/components/UncontrolledTransition";
import useHero from "../../../src/hooks/useHero";
import Styles from "./useHero.module.scss";

function HeroExample({ exampleStyle }: { exampleStyle: CSSProperties }) {
  const { heroRef } = useHero(
    "example",
    Object.keys(exampleStyle).map((a) =>
      a.replace(/[A-Z]/g, (upper) => {
        return "-" + upper.toLowerCase();
      })
    )
  );
  return (
    <div
      ref={heroRef}
      style={{
        background: "linear-gradient(to right, red, blue)",
        color: "white",
        fontWeight: "bold",
        ...exampleStyle,
      }}
    >
      I NEED A HERO
    </div>
  );
}

function ExampleCenario({
  start,
  exampleStyle = {},
}: {
  start: boolean;
  exampleStyle?: CSSProperties;
}) {
  return (
    <UncontrolledTransition transitionType={TransitionAnimationTypes.FADE}>
      {start ? (
        <div key={"1" + Math.random()}>
          <h1>Page one</h1>
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <h2>The hero is right below</h2>
          <HeroExample exampleStyle={exampleStyle} />
        </div>
      ) : (
        <div key={"2" + Math.random()}>
          <h1 style={{ display: "flex" }}>
            Now the here is right here
            <HeroExample exampleStyle={exampleStyle} />
          </h1>
        </div>
      )}
    </UncontrolledTransition>
  );
}

it("Should be able to transition 2 elements", () => {
  const chain = cy.mountChain((start: boolean) => {
    return <ExampleCenario start={start} />;
  });
  chain.remount(true).wait(250);
  chain.remount(false).wait(1000);
});

it("Should be able to transition other props", () => {
  const chain = cy.mountChain((start: boolean) => {
    return (
      <ExampleCenario
        start={start}
        exampleStyle={start ? { fontSize: 150 } : { fontSize: 24 }}
      />
    );
  });
  chain.remount(true).wait(250);
  chain.remount(false).wait(1000);
});

beforeEach(() => {
  //   document.body.style.setProperty("--animation--speed-fast", "5s");
});

it("Should be able to revert when the user restores old element", () => {
  const chain = cy.mountChain((start: boolean) => {
    return (
      <ExampleCenario
        start={start}
        exampleStyle={start ? { fontSize: 150 } : { fontSize: 24 }}
      />
    );
  });
  chain.remount(true).wait(250);
  chain.remount(false).wait(100);
  chain.remount(true);
});

it("Should immediatly remove the clone when the hero will not transition", () => {
  function Square() {
    const hero = useHero("bug");
    return (
      <div
        data-testid="square"
        ref={hero.heroRef}
        style={{
          width: 200,
          height: 200,
          backgroundColor: `rgb(${Math.random()}, ${Math.random()}, ${Math.random()})`,
        }}
      ></div>
    );
  }

  const chain = cy.mountChain((x: number, y: number) => (
    <>
      <UncontrolledTransition transitionType={TransitionAnimationTypes.FADE}>
        <div
          key={Math.random() + 1}
          style={{
            backgroundColor: "blue",
            height: 1000,
            width: 3000,
            paddingLeft: x,
            paddingTop: y,
          }}
        >
          <Square />
        </div>
      </UncontrolledTransition>
    </>
  ));
  chain
    .remount(0, 0)
    .then(() => {
      cy.byTestId("square").should("have.length", 1);
    })
    .wait(2000)
    .remount(401, 401)
    .then(() => {
      cy.byTestId("square").should("have.length", 3);
    });

  for (let _ of new Array(10).fill(undefined)) {
    const [x, y] = [Math.random() * 1000, Math.random() * 1000].map(Math.floor);
    cy.remount(x, y)
      .wait(500)
      .remount(x, y)
      .wait(500)
      .then(() => {
        cy.byTestId("square").should("have.length", 1);
      });
  }
});

it.only("Should not animate elements that are out of screen to reduce amount and increase performance", () => {
  cy.viewport(1000, 1000);
  const transitionedElements: Set<string> = new Set();
  window.addEventListener("transitionstart", (e) => {
    const div = e.target! as HTMLDivElement;
    if (!!div.id) {
      transitionedElements.add(div.id);
    }
  });
  function ElementToTransition({
    id,
    style,
  }: {
    id: string;
    style: CSSProperties;
  }) {
    const { heroRef } = useHero(id);
    return (
      <div
        id={id}
        ref={heroRef}
        style={{
          height: 200,
          width: 200,
          backgroundColor: "red",
          position: "absolute",
          fontSize: 180,
          color: "white",
          ...style,
        }}
      >
        {id}
      </div>
    );
  }
  const chain = cy.mountChain((transition: boolean) => {
    return (
      <UncontrolledTransition
        transitionType={TransitionAnimationTypes.COIN_FLIP}
        className={Styles.root}
      >
        {!transition ? (
          <Fragment key="1">
            <h1 style={{ margin: "auto" }}>First screen</h1>
            <ElementToTransition id="1" style={{ top: 40, left: 40 }} />
            <ElementToTransition id="2" style={{ top: 80, left: 900 }} />
            <ElementToTransition id="3" style={{ top: 1000, left: 50 }} />{" "}
            {/** This is coming from outside the viewport and should not animate */}
            <ElementToTransition id="4" style={{ top: 80, left: 1010 }} />{" "}
            {/** This is coming from outside the viewport and should not animate */}
            <ElementToTransition id="5" style={{ top: 500, left: 500 }} />
          </Fragment>
        ) : (
          <Fragment key="2">
            <h1 style={{ margin: "auto" }}>Second screen</h1>
            <ElementToTransition id="1" style={{ top: -200, left: 20 }} />{" "}
            {/** This is going outside the viewport and should also not animate */}
            <ElementToTransition id="2" style={{ top: 280, left: 60 }} />
            <ElementToTransition id="3" style={{ top: 70, left: 400 }} />
            <ElementToTransition id="4" style={{ top: 600, left: 600 }} />
            <ElementToTransition id="5" style={{ top: 700, left: 900 }} />
          </Fragment>
        )}
      </UncontrolledTransition>
    );
  });

  chain
    .remount(false)
    .wait(1000)
    .remount(true)
    .wait(1000)
    .then(() => {
      expect(Array.from(transitionedElements)).to.deep.eq(["2", "5"]);
      transitionedElements.clear();
    })
    .remount(false)
    .wait(1000)
    .then(() => {
      expect(Array.from(transitionedElements)).to.deep.eq(["2", "5"]);
      transitionedElements.clear();
    });
});
