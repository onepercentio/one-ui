import useAsyncMemo from "hooks/utility/useAsyncMemo";
import { useEffect, useState } from "react";

it("Should not allow the latest version of dep array be overwritten by old async process", () => {
  const Cenario = () => {
    const [dep, setDep] = useState(0);
    const [postDep] = useAsyncMemo(async () => {
      await new Promise<void>((r) =>
        setTimeout(
          () => {
            r();
            /**The first (old) async process will take longer, so it's result will override new setup */
          },
          dep === 0 ? 1000 : 200,
        ),
      );
      return dep;
    }, [dep]);

    useEffect(() => {
      /** This will trigger next async process */
      setDep((o) => o + 1);
    }, []);

    return (
      <>
        <h1>DEP: {dep}</h1>
        <h1>ASYNC: {postDep}</h1>
      </>
    );
  };
  cy.mount(<Cenario />);
  cy.wait(2000);
  cy.contains("ASYNC: 1");
});

it.only("Should be able to return the retry result", () => {
  let retryPromise: Promise<string>;
  let content: string = "first";
  let spy = cy.spy();
  const Cenario = () => {
    const [toShow = "not set", _, __, retry] = useAsyncMemo(async () => {
      return await new Promise<string>((r) =>
        setTimeout(() => {
          r(content);
          /**The first (old) async process will take longer, so it's result will override new setup */
        }, 1000),
      );
    }, []);

    return (
      <>
        <h1>{toShow}</h1>
        <button onClick={() => (retryPromise = retry())}>Retry</button>
      </>
    );
  };
  cy.mount(<Cenario />);
  cy.contains("not set");
  cy.wait(1100);
  cy.contains("first").then(() => {
    content = "retry";
  });
  cy.get("button").click();
  cy.contains("retry").then(() => {
    retryPromise.then((r) => expect(r).to.eq("retry"));
  });
});
