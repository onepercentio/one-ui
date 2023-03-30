import { mount } from "cypress/react";
import {
  ComponentProps,
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import AdaptiveDialog from "../../../src/components/AdaptiveDialog";
import AnimatedEntrance from "../../../src/components/AnimatedEntrance/AnimatedEntrance";
import Button from "../../../src/components/Button";
import LoaderDotsIndicator from "../../../src/components/LoaderDotsIndicator";
import Loader from "../../../src/components/LoaderDotsIndicator";
import UncontrolledTransition from "../../../src/components/UncontrolledTransition";
import { useAsyncProcess } from "../../../src/context/AsyncProcess";
import {
  AsyncProcessQueueProvider,
  AsyncQueueErrors,
  UIStateFactory,
  useAsyncProcessQueue,
  useAsyncProcessQueueContext,
  useRecoveries,
} from "../../../src/context/AsyncProcessQueue";
import { resetRegistrationCounter } from "../../../src/context/AsyncProcessQueue.development";
import useAsyncControl from "../../../src/hooks/useAsyncControl";
import TestStyles from "./AsyncProcessQueue.module.scss";

const MockUIFactory: () => UIStateFactory = () => {
  const date = Math.random();

  return (status) => <h1 key={date}>{status}</h1>;
};

beforeEach(() => {
  resetRegistrationCounter();
});

it.each(
  [
    { width: 1920, height: 1800 },
    // { width: 320, height: 480 },
  ],
  "Should animate the component from UI to queue Element",
  (resolution) => {
    let manualResolvers: (() => void)[] = [];
    let manualRejectors: ((e: Error) => void)[] = [];
    const _doStuff = () =>
      new Promise<void>((r, rej) => {
        manualResolvers.push(r);
        manualRejectors.push(rej);
      });
    const style: CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "red",
      borderRadius: "50%",
    };
    const style2: CSSProperties = {
      ...style,
      backgroundColor: "blue",
    };
    function Bullseye() {
      const [o, so] = useState(false);
      const { UIs, setUIs } = useAsyncProcessQueueContext();

      return (
        <>
          <AdaptiveDialog
            className={TestStyles.something}
            open={o}
            onClickOut={() => so(false)}
          >
            <AnimatedEntrance>{UIs}</AnimatedEntrance>
            <Button
              onClick={() =>
                setUIs((prev) => prev.filter((ui) => ui.status !== "succeded"))
              }
            >
              Clean
            </Button>
          </AdaptiveDialog>
          <div
            data-testid="bullseye"
            onClick={() => so(true)}
            style={{ width: 70, height: 70, ...style2 }}
          >
            <div style={{ width: 60, height: 60, ...style }}>
              <div style={{ width: 50, height: 50, ...style2 }}>
                <div style={{ width: 40, height: 40, ...style }}>
                  <div style={{ width: 30, height: 30, ...style2 }}>
                    <div style={{ width: 20, height: 20, ...style }}>
                      <div style={{ width: 10, height: 10, ...style2 }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }
    function DoSomeAsyncStuff({ exit }: { exit: () => void }) {
      const refNum = useRef(Math.random());
      const { test } = useRecoveries();
      const {
        doStuff: __doStuff,
        elToTransitionToQueue,
        wrapQueue,
      } = useAsyncProcessQueue(
        {
          doStuff: () => {
            test.write();
            return _doStuff();
          },
        },
        () => ["exampleUI"]
      );
      const { loading, doStuff } = useAsyncControl({ doStuff: __doStuff });

      useLayoutEffect(() => wrapQueue, []);
      return (
        <h1
          ref={elToTransitionToQueue}
          style={{ position: "relative", top: "80vh", display: "inline-block" }}
        >
          This should animate to target{" "}
          <button
            onClick={() => {
              doStuff().catch(() => {});
            }}
            disabled={loading}
          >
            Click to start
            {loading && <Loader dotsCount={10} />}
          </button>
          <button onClick={exit}>Click for magic</button>
        </h1>
      );
    }
    function Wrapper() {
      const [elementExist, ss] = useState(true);
      const [elementExist2, ss2] = useState(true);
      const [elementExist3, ss3] = useState(true);
      const target = useAsyncProcessQueueContext().targetElRef;
      return (
        <>
          <div
            style={{
              width: 80,
              height: 80,
              ...style,
              position: "absolute",
              top: 32,
              right: 32,
            }}
            ref={target as any}
          >
            <Bullseye />
          </div>
          {elementExist && <DoSomeAsyncStuff exit={() => ss(false)} />}
          {elementExist2 && <DoSomeAsyncStuff exit={() => ss2(false)} />}
          {elementExist3 && <DoSomeAsyncStuff exit={() => ss3(false)} />}
        </>
      );
    }
    cy.on("uncaught:exception", () => false);
    cy.viewport(resolution.width, resolution.height).then(() => {
      mount(
        <AsyncProcessQueueProvider
          recoveries={{
            test: {
              clear: () => {},
              write: () => {},
              recover: () => [],
            },
          }}
          uiFactory={(ui) => (state, e, dismiss, retry) => {
            switch (state) {
              case "loading":
                return (
                  <UncontrolledTransition key={ui as string}>
                    <h1 style={{ color: "white", fontSize: 74 }} key={state}>
                      Cargando <LoaderDotsIndicator dotsCount={5} />
                    </h1>
                  </UncontrolledTransition>
                );
              case "failed":
                return (
                  <UncontrolledTransition key={ui as string}>
                    <h1 style={{ color: "white", fontSize: 74 }} key={state}>
                      <Button onClick={retry}>Tentar denovo</Button>
                    </h1>
                  </UncontrolledTransition>
                );
              case "succeded":
                return (
                  <UncontrolledTransition key={ui as string}>
                    <h1 style={{ color: "white", fontSize: 74 }} key={state}>
                      Funcionou
                    </h1>
                  </UncontrolledTransition>
                );
            }
          }}
        >
          <Wrapper />
        </AsyncProcessQueueProvider>
      ).wait(1000);
      cy.get("button").eq(0).click().wait(100);
      cy.get("button")
        .eq(1)
        .wait(100)
        .click()
        .wait(500)
        .then(() => {
          cy.get("button").eq(0).click().wait(100);
          cy.get("button").eq(1).wait(100).click().wait(500);
        })
        .then(() => {
          cy.get("button").eq(1).wait(100).click().wait(500);
        });
      cy.byTestId("bullseye").click();
      cy.contains("Cargando .....").then(() => {
        manualResolvers[0]();
      });
      cy.contains("Clean")
        .click()
        .wait(2000)
        .then(() => {
          manualRejectors[1](new Error("xpto"));
        })
        .wait(500)
        .then(() => {
          cy.contains("Tentar denovo")
            .click()
            .wait(500)
            .then(() => {
              manualResolvers[2]();
            })
            .wait(500)
            .then(() => {
              cy.contains("Clean").click();
            });
        });
    });
  }
);

describe("Business Rules", () => {
  it("Should provide a way to trigger self recovering async processes", () => {
    /**
     * Suppose we have the following cenario
     *
     * A user clicks a button to build something on the blockchain
     *
     * Here are the steps:
     * 1 - The user clicks the button
     * 2 - We call the contract
     * 3 - The operation is scheduled for mining
     * 4 - After mined we update the UI
     *
     * 1 - If the user reloads during this, nothing happens
     * 2 - If the user reloads while the contract is called we can't do anything because the contract didn't return yet
     * 3 - When the user reloads here, we could restore the process by recovering the thash
     * 4 - If the user reloaded before, the 3 ended, the ui will be outdated
     */
    function BaseUI() {
      const { on } = useAsyncProcess();

      useEffect(() => {
        on("waitForBuild", () => alert("Wait for build"));
      }, []);
    }
    /** This is the function that schedules the Async ui */
    waitForCrafting();
    /** This is the generic function */
    waitForMining();

    /** This should be a callback */
    onCrafted();
  });
});
