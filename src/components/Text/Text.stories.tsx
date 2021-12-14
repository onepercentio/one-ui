import React from "react";
import Spacing from "../Spacing";
import C from "./Text";

export default {
  component: C,
  title: "Variantes de texto",
};

export const TodasVariacoes = () => {
  const variantes: { value: string }[] = (C as any).__docgenInfo.props.type.type
    .value;

  return variantes
    .map((a) => JSON.parse(a.value))
    .map((a) => (
      <div
        style={{
          width: "25%",
          marginRight: 24,
          display: "inline-flex",
          flexDirection: "column",
        }}
      >
        <span style={{ borderBottom: "2px solid black", marginBottom: 14 }}>
          Tipo: <b>{a}</b>
        </span>
        <C type={a as any}>Texto do exemplo</C>
        <Spacing size="large" />
      </div>
    ));
};

export const Primary = (args: any) => <C {...args}>{args.exampleText}</C>;
Primary.args = {
  exampleText: "Texto de exemplo",
};
