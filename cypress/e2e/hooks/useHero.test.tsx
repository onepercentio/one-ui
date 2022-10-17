import { CSSProperties } from "react";
import { TransitionAnimationTypes } from "../../../src/components/Transition";
import UncontrolledTransition from "../../../src/components/UncontrolledTransition";
import useHero from "../../../src/hooks/useHero";

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
