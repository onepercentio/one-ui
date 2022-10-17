import React from "react";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import C, { _Text as CompType } from "./Text";

export default {
  component: CompType,
  title: "Variantes de texto",
};

export const TodasVariacoes = () => {
  const variantes = extractAllPossibilitiesFromEnumProp(CompType, "type");

  return variantes.map((a) => (
    <SideBySideContainer exampleName={a}>
      <C type={a as any}>Texto do exemplo</C>
    </SideBySideContainer>
  ));
};
