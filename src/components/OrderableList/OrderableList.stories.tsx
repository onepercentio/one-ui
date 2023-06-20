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
        <MutableHamburgerButton size={24} />
      </div>
    </>
  );
}

const xpto: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "48px 0px",
  background:
    "linear-gradient(#0000 5%, #f003 10% 48%,#0f03 48%, #0f03 50%, #0f03 52%,#00f3 52% 90%, #0000 95%)",
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

export const Shrinkable = (args: any) => {
  const shrinkTo = args.shrinkToOnOrder || 96;
  return (
    <>
      <h1>Shrinking to {shrinkTo}px</h1>
      <InitialImplementation shrinkToOnOrder={shrinkTo} />
    </>
  );
};
Shrinkable.args = {} as Partial<React.ComponentProps<typeof OrderableList>>;
