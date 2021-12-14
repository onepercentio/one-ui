import React from "react";
import Comp from ".";
import Spacing from "../Spacing";

export default {
  component: Comp,
  title: "Botão",
};

export const TodasVariacoes = () => {
  const variantes: { value: string }[] = (Comp as any).__docgenInfo.props
    .variant.type.value;

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
        <Comp variant={a as any}>Texto do exemplo</Comp>
        <Spacing size="large" />
      </div>
    ));
};

export const Primary = (args: React.ComponentProps<typeof Comp>) => (
  <Comp {...args}>Um simples botão</Comp>
);
