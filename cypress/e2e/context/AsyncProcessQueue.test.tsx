import { mount } from "cypress/react";
import { CSSProperties, useState } from "react";
import Loader from "../../../src/components/LoaderDotsIndicator";
import {
  AsyncProcessQueueProvider,
  useAsyncProcessQueue,
  useAsyncProcessQueueContext,
} from "../../../src/context/AsyncProcessQueue";
import useAsyncControl from "../../../src/hooks/useAsyncControl";

it.only("Should animate the component from UI to queue Element", () => {
  function DoSomeAsyncStuff({ exit }: { exit: () => void }) {
    const _doStuff = () =>
      new Promise<void>((r) => {
        setTimeout(() => {
          r();
        }, 2000);
      });
    const { doStuff: __doStuff, elToTransitionToQueue } = useAsyncProcessQueue({
      doStuff: _doStuff,
    });
    const { loading, doStuff } = useAsyncControl({ doStuff: __doStuff });
    return (
      <h1
        ref={elToTransitionToQueue}
        style={{ position: "relative", top: "80vh", display: "inline-block" }}
      >
        This should animate to target{" "}
        <button onClick={doStuff} disabled={loading}>
          Click to start
          {loading && <Loader dotsCount={10} />}
        </button>
        <button onClick={exit}>Click for magic</button>
      </h1>
    );
  }
  function Wrapper() {
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
    const [elementExist, ss] = useState(true);
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
          <div style={{ width: 70, height: 70, ...style2 }}>
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
        </div>
        {elementExist && <DoSomeAsyncStuff exit={() => ss(false)} />}
      </>
    );
  }
  mount(
    <AsyncProcessQueueProvider>
      <Wrapper />
    </AsyncProcessQueueProvider>
  );
  cy.get("button").first().click();
  cy.get("button").last().wait(100).click();
});
