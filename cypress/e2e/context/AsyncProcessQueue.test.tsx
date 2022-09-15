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
  const date = Math.random()

  return (status) => <h1 key={date}>{status}</h1>
}

beforeEach(() => {
  resetRegistrationCounter()
})

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
      const {test} = useRecoveries()
      const {
        doStuff: __doStuff,
        elToTransitionToQueue,
        wrapQueue,
      } = useAsyncProcessQueue(
        {
          doStuff: () => {
            test.write();
            return _doStuff()
          },
        },
        () =>  ["exampleUI"]
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
        <AsyncProcessQueueProvider recoveries={{
          test: {
            clear: () => {},
            write: () => {},
            recover: () => []
          }
        }} uiFactory={(ui) => (state, e, dismiss, retry) => {
          switch(state) {
            case "loading":
              return <UncontrolledTransition key={ui as string}><h1 style={{color: "white", fontSize: 74}} key={state}>Cargando <LoaderDotsIndicator dotsCount={5}/></h1></UncontrolledTransition>
            case "failed":
              return <UncontrolledTransition key={ui as string}><h1 style={{color: "white", fontSize: 74}} key={state}><Button onClick={retry}>Tentar denovo</Button></h1></UncontrolledTransition>
            case "succeded":
              return <UncontrolledTransition key={ui as string}><h1 style={{color: "white", fontSize: 74}} key={state}>Funcionou</h1></UncontrolledTransition>
          }
        }}>
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
  function Child() {
    const [show, off] = useState(true);
    const { elToTransitionToQueue, wrapQueue, test } = useAsyncProcessQueue(
      {
        test: () => new Promise<void>(() => {}),
      },
      () => ["exampleUI"]
    );
    const { targetElRef } = useAsyncProcessQueueContext();

    useLayoutEffect(() => {
      test();
    }, []);

    useEffect(() => {
      wrapQueue();
      off(false);
    }, []);

    return (
      <>
        <span
          ref={targetElRef}
          style={{
            backgroundColor: "green",
            position: "fixed",
            top: 0,
            right: 0,
            fontSize: 72,
            padding: "24px",
          }}
        >
          Target
        </span>

        {show && (
          <div
            ref={elToTransitionToQueue}
            style={{
              backgroundColor: "blue",
              position: "absolute",
              bottom: 0,
              fontSize: 72,
              padding: "24px",
            }}
          >
            Child
          </div>
        )}
      </>
    );
  }
  function Wrapper() {
    return (
      <>
        <AsyncProcessQueueProvider recoveries={{}} uiFactory={MockUIFactory}>
          <Child />
        </AsyncProcessQueueProvider>
      </>
    );
  }
  function bindTransition() {
    const transitionStartCb = cy.spy();
    const transitionEndCb = cy.spy();

    window.addEventListener("transitionstart", transitionStartCb);
    window.addEventListener("transitionend", transitionEndCb);

    return {
      end: transitionEndCb,
      start: transitionStartCb,
    };
  }
  it("Should animate element to the target element", () => {
    const { end, start } = bindTransition();
    mount(<Wrapper />);
    cy.waitUntil(
      () => {
        return start.getCalls().length > 0;
      },
      {
        customMessage: "Wait until started",
      }
    )
      .waitUntil(() => end.getCalls().length > 0, {
        customMessage: "Wait until ended",
      })
      .wait(100)
      .then(() => {
        expect(start).to.be.calledTwice;
        expect(end).to.be.calledOnce;
      });
  });
  describe("Async process recovery", () => {
    describe("Developer experience", () => {
      type BlockchainTransactionId = "0x007";
      type ExampleDescription = "description";
      type ExampleTitle = "title";
      type ExampleRecoveryModel = {
        metamaskExample: [
          BlockchainTransactionId,
          ExampleTitle,
          ExampleDescription
        ];
      };
      function TargetWrapper() {
        const { targetElRef } = useAsyncProcessQueueContext();
        return <div ref={targetElRef} />;
      }
      type Base = typeof AsyncProcessQueueProvider<ExampleRecoveryModel>;
      function Wrapper({
        children,
        recoveries,
      }: PropsWithChildren<{
        recoveries: ComponentProps<Base>["recoveries"];
      }>) {
        return (
          <AsyncProcessQueueProvider recoveries={recoveries} uiFactory={MockUIFactory}>
            {children}
            <TargetWrapper />
          </AsyncProcessQueueProvider>
        );
      }
      it("Should be able to warn the user that the async operation is not recoverable", () => {
        const writeCb = cy.spy();
        const clearCb = cy.spy();

        cy.mountHookWrap(
          () => {
            const { metamaskExample } = useRecoveries<ExampleRecoveryModel>();
            return useAsyncProcessQueue({
              aFunctionWithoutRecovery() {
                return Promise.resolve();
              },
              aFunctionWithRecoveryAndClear() {
                metamaskExample.write("0x007", "title", "description");
                metamaskExample.clear("0x007", "title", "description");
                return Promise.resolve();
              },
              aFunctionWithRecovery() {
                metamaskExample.write("0x007", "title", "description");
                return Promise.resolve();
              },
            }, () => ["exampleUI"]);
          },
          ({ children }: any) => (
            <Wrapper
              recoveries={{
                metamaskExample: {
                  clear: clearCb,
                  write: writeCb,
                  recover: () => [],
                },
              }}
            >
              {children}
            </Wrapper>
          )
        )
          .then((ctx) => {
            cy.expectRejection(
              ctx.current!.aFunctionWithoutRecovery,
              AsyncQueueErrors.RECOVERY_IS_NOT_BEING_CALLED
            )
              .then(() => {
                ctx.current!.aFunctionWithRecovery();
                expect(writeCb).to.be.calledOnce;
              })
              .then(() => writeCb.resetHistory())
              .then(() => {
                ctx.current!.aFunctionWithRecoveryAndClear();
                expect(writeCb).to.be.calledOnce;
                expect(clearCb).to.be.calledOnce;
              })
              .expectRejection(
                ctx.current!.aFunctionWithoutRecovery,
                AsyncQueueErrors.RECOVERY_IS_NOT_BEING_CALLED
              );
          })
          .wait(100);
      });

      it("Should be able to recover async processes", () => {
        cy.mountHookWrap(useAsyncProcessQueueContext, ({ children }: any) => (
          <Wrapper
            recoveries={{
              metamaskExample: {
                clear: () => {},
                write: () => {},
                recover: () => [
                  [Promise.resolve(), () => Promise.resolve(), "exampleUI"],
                  [Promise.reject(), () => Promise.resolve(), "exampleUI"],
                ],
              },
            }}
          >
            {children}
          </Wrapper>
        )).waitUntil((ctx) => ctx!.current!.UIs.length === 2)
      });
    });
  });
});
