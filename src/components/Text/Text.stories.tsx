import React from "react";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import C from "./Text";

export default {
  component: C,
  title: "Variantes de texto",
};

export const TodasVariacoes = () => {
  const variantes = extractAllPossibilitiesFromEnumProp(C, "type");

  return variantes.map((a) => (
    <SideBySideContainer exampleName={a}>
      <C type={a as any}>Texto do exemplo</C>
    </SideBySideContainer>
  ));
};
