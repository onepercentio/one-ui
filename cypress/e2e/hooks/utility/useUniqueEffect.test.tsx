import ContextAsyncControlProvider from "context/ContextAsyncControl";
import useUniqueEffect from "hooks/utility/useUniqueEffect";

it("Should be able to call a single time", () => {
  function Wrapper() {
    useUniqueEffect("some-hook", () => alert("I call"), []);
    return <></>;
  }
  cy.mount(
    <ContextAsyncControlProvider>
      <Wrapper key={"a"} />
      <Wrapper key={"b"} />
      <Wrapper key={"c"} />
    </ContextAsyncControlProvider>
  )
    .wait(1000)
    .mount(
      <ContextAsyncControlProvider>
        <Wrapper key={"a"} />
        <Wrapper key={"c"} />
      </ContextAsyncControlProvider>
    );
});
