import React, { CSSProperties, useEffect, useRef, useState } from "react";
import MutableHamburgerButton from "../MutableHamburgerButton";
import OrderableList, {
  OrderableListReorderMode,
  useOrderableListAnchor,
} from "./OrderableList";

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
          height: 100,
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

export const OrderableTable = (args: any) => {
  const [abc, setAbc] = useState("abcdefghijklmnopqrstuvwxyz");
  function Anchor() {
    const { anchorRef } = useOrderableListAnchor();

    return (
      <div
        ref={anchorRef}
        style={{ position: "absolute", top: "8px", right: "8px" }}
      >
        <MutableHamburgerButton state="hamburger" size={24} />
      </div>
    );
  }

  useEffect(() => {
    setTimeout(() => {
      setAbc("aeiou");
    }, 500);
  }, []);
  return (
    <>
      <OrderableList {...args} mode={OrderableListReorderMode.TWO_DIMENSIONS}>
        {abc.split("").map((char) => (
          <div
            style={{
              padding: 10,
            }}
            key={char}
          >
            <div
              style={{
                width: 100,
                height: 100,
                border: "2px solid black",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textTransform: "uppercase",
                fontWeight: "bold",
                fontSize: 74,
                position: "relative",
              }}
            >
              {char}
              <Anchor />
            </div>
          </div>
        ))}
      </OrderableList>
    </>
  );
};
