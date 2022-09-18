import React, { CSSProperties, useRef } from "react";
import MutableHamburgerButton from "../MutableHamburgerButton";
import OrderableList, { useOrderableListAnchor } from "./OrderableList";

export default {
  component: OrderableList,
  title: "Orderable List",
};

function Wrapper({ i }: { i: number }) {
  const { anchorRef } = useOrderableListAnchor();
  return (
    <>
      <div
        ref={anchorRef}
        style={{
          display: "inline-block",
          height: 300,
        }}
        data-testid={`click`}
      >
        <MutableHamburgerButton size={256} />
      </div>
    </>
  );
}

const xpto: CSSProperties = {
  display: "flex",
  alignItems: "center",
  background:
    "linear-gradient(#f003 48%,#0f03 48%, #0f03 50%, #0f03 52%,#00f3 52%)",
};

export const InitialImplementation = (args: any) => {
  return (
    <>
      <OrderableList {...args}>
        <div key={"1"} data-testid="movable" style={xpto}>
          <h1>
            <Wrapper i={1} /> 1
          </h1>
        </div>
        <div key={"2"} data-testid="movable" style={xpto}>
          <h1>
            <Wrapper i={2} /> 2
          </h1>
        </div>
        <div key={"3"} data-testid="movable" style={xpto}>
          <h1>
            <Wrapper i={3} /> 3
          </h1>
        </div>
        <div key={"4"} data-testid="movable" style={xpto}>
          <h1>
            <Wrapper i={4} /> 4
          </h1>
        </div>
        <div key={"5"} data-testid="movable" style={xpto}>
          <h1>
            <Wrapper i={5} /> 5
          </h1>
        </div>
      </OrderableList>
    </>
  );
};
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof OrderableList>
>;
