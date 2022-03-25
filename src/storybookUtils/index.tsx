import React, { ComponentProps, PropsWithChildren } from "react";
import Spacing from "../components/Spacing";

export function extractAllPossibilitiesFromEnumProp<
  C extends React.JSXElementConstructor<any>,
  K extends keyof P,
  P = ComponentProps<C>
>(component: C, propName: K): P[K][] {
  return (component as any).__docgenInfo.props[propName].type.value.map(
    (a: { value: string }) => JSON.parse(a.value)
  ) as P[K][];
}

export function SideBySideContainer({
  children,
  exampleName,
}: PropsWithChildren<{ exampleName: string }>) {
  return (
    <div
      style={{
        width: "25%",
        marginRight: 24,
        display: "inline-flex",
        flexDirection: "column",
      }}
    >
      <span style={{ borderBottom: "2px solid black", marginBottom: 14 }}>
        Tipo: <b>{exampleName}</b>
      </span>
      {children}
      <Spacing size="large" />
    </div>
  );
}
