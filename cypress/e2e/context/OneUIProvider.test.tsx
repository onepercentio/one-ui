import { mount } from "cypress/react";
import { ComponentProps, PropsWithChildren } from "react";
import OneUIProvider, {
  useOneUIConfig,
  ContextSpecs,
} from "../../../src/context/OneUIProvider";
import { DeepPartial } from "../../../src/utils";

function WrapperFactory(props: DeepPartial<ContextSpecs>) {
  return ({ children }: PropsWithChildren<{}>) => {
    return <OneUIProvider config={props}>{children}</OneUIProvider>;
  };
}

it("Should return the string when the value exists", () => {
  cy.mountHookWrap(
    () => useOneUIConfig("component.input.className"),
    WrapperFactory({
      component: { input: { border: false, className: "someclassname" } },
    })
  ).then((r) => {
    expect(r.current).to.eq("someclassname");
  });
});
it.only("Should give false when comparing", () => {
  function Wrap() {
    const classes = useOneUIConfig("component.text.className", {});
    return (
      <div>
        {/* <h1 className={classes.boldTitle}>Access: </h1> */}
        <h1 className={classes.boldTitle || "SOMETHING"}>Or: </h1>
      </div>
    );
  }
  mount(
    <OneUIProvider config={{}}>
      <Wrap />
    </OneUIProvider>
  );
});
