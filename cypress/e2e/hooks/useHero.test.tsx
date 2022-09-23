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
