import { CSSProperties, Fragment, PropsWithChildren } from "react";
import { TransitionAnimationTypes } from "../../../src/components/Transition";
import UncontrolledTransition from "../../../src/components/UncontrolledTransition";
import useHero, { TRANSITION_FACTORY } from "../../../src/hooks/useHero";
import Styles from "./useHero.module.scss";
import chroma from "chroma-js";

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

function ElementToTransition({
  id,
  style,
}: {
  id: string;
  style?: CSSProperties;
}) {
  const { heroRef } = useHero(id, ["background-color"], {
    onHeroStart: (clone) => {
      clone.style.marginLeft = "0px";
    },
    onBeforeTransition: (el) => {
      return [el.parentElement!, el.parentElement!];
    },
  });
  return (
    <div
      id={id}
      ref={heroRef}
      style={{
        height: 200,
        width: 200,
        minHeight: 200,
        minWidth: 200,
        backgroundColor: style ? "red" : chroma.random().hex(),
        position: style ? "absolute" : undefined,
        fontSize: style ? 180 : 20,
        color: "white",
        ...style,
      }}
    >
      {id}
    </div>
  );
}

it("Should not animate elements that are out of screen to reduce amount and increase performance", () => {
  cy.viewport(1000, 1000);
  const transitionedElements: Set<string> = new Set();
  window.addEventListener("transitionstart", (e) => {
    const div = e.target! as HTMLDivElement;
    if (!!div.id) {
      transitionedElements.add(div.id);
    }
  });
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

it("Should be able to bounds container for transition optimization", () => {
  cy.viewport(1000, 1000);
  cy.window().then((w) => {
    w.document.body.style.setProperty("--animation--speed-fast", "5s");
  });

  const Row = ({
    children,
    style,
  }: PropsWithChildren<{ style?: CSSProperties }>) => {
    return (
      <div
        style={{
          ...style,
          backgroundColor: chroma.random().hex(),
          display: "flex",
          overflow: "auto",
        }}
        data-testid="row"
      >
        {children}
      </div>
    );
  };

  const chain = cy.mountChain((transition: boolean) => {
    const def = (
      <>
        <ElementToTransition id="def_1" />
        <ElementToTransition id="def_2" />
        <ElementToTransition id="def_3" />
        <ElementToTransition id="def_4" />
        <ElementToTransition id="def_5" />
      </>
    );
    const small = (
      <>
        <ElementToTransition
          id="small_1"
          style={{
            marginLeft: -200,
            backgroundColor: chroma.random().hex(),
            position: "initial",
            fontSize: 20,
          }}
        />
        <ElementToTransition id="small_2" />
        <ElementToTransition id="small_3" />
        <ElementToTransition id="small_4" />
        <ElementToTransition id="small_5" />
      </>
    );
    return (
      <UncontrolledTransition transitionType={TransitionAnimationTypes.FADE}>
        {!transition ? (
          <Fragment key="1">
            <h1 style={{ margin: "auto" }}>First screen</h1>
            <Row>{def}</Row>
            <Row style={{ margin: "0px 20vw" }}>{small}</Row>
          </Fragment>
        ) : (
          <Fragment key="2">
            <h1 style={{ margin: "auto" }}>Second screen</h1>
            <br />
            <Row>{def}</Row>
            <Row style={{ margin: "0px 20vw" }}>{small}</Row>
          </Fragment>
        )}
      </UncontrolledTransition>
    );
  });
  chain
    .remount(false)
    .wait(2000)
    .remount(true)
    .wait(250)
    .then(() => {
      cy.window().then((w) => {
        expect(w.document.querySelectorAll("[data-hero-clone]").length).to.eq(
          8
        );
      });
    });
});

/**
 * Dunno how to call the effect I'm creating
 */
it("Should be able to apply centrifuge force effect", () => {
  cy.viewport(2000, 2000);
  function Hero({ p }: { p: [left: number, top: number] }) {
    const h = useHero("square", undefined, TRANSITION_FACTORY.ACCELERATION());
    return (
      <div
        ref={h.heroRef}
        style={{
          height: 300,
          width: 300,
          position: "absolute",
          top: p[1],
          left: p[0],
          background: "linear-gradient(red, green, purple)",
        }}
      />
    );
  }
  function Wrapper({ p }: { p: [left: number, top: number] }) {
    return (
      <div
        style={{
          width: 2000,
          height: 2000,
          position: "relative",
          backgroundColor: "blue",
        }}
      >
        <UncontrolledTransition transitionType={TransitionAnimationTypes.FADE}>
          <div
            key={p.join(",")}
            style={{
              width: 2000,
              height: 2000,
              position: "relative",
            }}
          >
            <Hero p={p} />
          </div>
        </UncontrolledTransition>
      </div>
    );
  }
  const chain = cy.mountChain((p: [left: number, top: number]) => (
    <Wrapper p={p} />
  ));
  function goTo(
    p: readonly [left: number, top: number],
    skipPause: boolean = false
  ) {
    cy.log(`Remounting ${p.join(", ")}`);
    chain.remount(p as any);
    if (!skipPause) cy.pause();
    else cy.wait(1600);
  }
  goTo([377.0918303779677, 101.29989459343993]);
  goTo([946.7953627605262, 1515.9577735297455]);

  for (let pos of new Array(100)
    .fill(undefined)
    .map(() => [Math.random() * 1700, Math.random() * 1700] as const))
    goTo(pos, true);
  goTo([0, 850]);
  goTo([1700, 850]);
  goTo([1700, 0]);
  goTo([0, 1700]);
  goTo([0, 0]);
  goTo([1700, 1700]);
  goTo([0, 1700]);
  goTo([0, 850]);
  goTo([0, 0]);
});

it.only("Should be able to hide/show dynamic elements between heroes", () => {
  function Wrapper({ cenario }: { cenario: "a" | "b" }) {
    const { heroRef, heroComponentRef } = useHero("test-composition");
    const RESET = { margin: "0px" };
    const BIG = { fontSize: "32px", ...RESET };
    return (
      <div
        ref={heroRef}
        style={{
          backgroundColor: "red",
          display: "inline-block",
          position: "relative",
          top: cenario === "a" ? 400 : 0,
          left: cenario === "b" ? 400 : 0,
          width: "500px",
        }}
      >
        {cenario === "a" && (
          <>
            <div ref={heroComponentRef("only-a")}>
              <p style={BIG}>I am only shown on cenario A</p>
            </div>
            <div ref={heroComponentRef("only-a2")}>
              <p style={BIG}>I also is shown on cenario A</p>
            </div>
            <div ref={heroComponentRef("only-a3")}>
              <p style={BIG}>Well here we are cenario A</p>
            </div>
          </>
        )}
        <div>
          <p style={RESET}>I am always shown</p>
        </div>
        {cenario === "b" && (
          <div ref={heroComponentRef("only-b")}>
            <p style={BIG}>I am only shown on cenario B</p>
          </div>
        )}
        <div>
          <p style={RESET}>I am also always shown</p>
        </div>
      </div>
    );
  }
  cy.document().then((d) => {
    d.body.style.setProperty("--animation--speed-fast", "1s");
  });
  const chain = cy.mountChain((cenario: "a" | "b") => {
    return (
      <UncontrolledTransition
        transitionType={TransitionAnimationTypes.FADE}
        style={{ alignItems: "flex-start" }}
      >
        <Wrapper cenario={cenario} key={cenario} />
      </UncontrolledTransition>
    );
  });
  chain.remount("a");
  cy.pause();
  chain.remount("b");
  cy.pause();
  chain.remount("a");
  cy.pause();
  chain.remount("b");
});
