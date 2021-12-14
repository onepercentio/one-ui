import React from "react";
import C from "./Spacing";

export default {
  component: C,
  title: "Espaçamento",
};

export const TodasVariacoes = () => {
  const variantes: { value: string }[] = (C as any).__docgenInfo.props.size
    .type.value;

  return variantes
    .map((a) => JSON.parse(a.value))
    .map((a) => (
      <div
        style={{
          width: "25%",
          marginRight: 24,
          display: "inline-flex",
          minHeight: "300px", 
          flexDirection: "column",
          backgroundColor: "lightyellow"
        }}
      >
        <span style={{ borderBottom: "2px solid black", marginBottom: 14 }}>
          Tipo: <b>{a}</b>
        </span>
        <span>Item antes do espacamento</span>
        <C size={a as any} />
        <span>Item depois do espacamento</span>
        <C size="33" />
      </div>
    ));
};
