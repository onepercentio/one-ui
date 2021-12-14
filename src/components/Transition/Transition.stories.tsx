import React from "react";
import Text from "../Text";
import Transition from "./Transition";

export default {
  component: Transition,
  title: "Transitor de elementos",
};

export const InitialImplementation = (args: any) => (
  <>
    <Transition {...args}>
      <div style={{ backgroundColor: "red" }}>
        <Text style={{ padding: 48, textAlign: "center" }} type="title">
          Etapa 1
        </Text>
      </div>
      <div style={{ backgroundColor: "green" }}>
        <Text style={{ padding: 48, textAlign: "center" }} type="title">
          Etapa 2
        </Text>
      </div>
      <div style={{ backgroundColor: "blue" }}>
        <Text style={{ padding: 48, textAlign: "center" }} type="title">
          Etapa 3
        </Text>
      </div>
      <div style={{ backgroundColor: "yellow" }}>
        <Text style={{ padding: 48, textAlign: "center" }} type="title">
          Etapa 4
        </Text>
      </div>
    </Transition>
    <h1>Controle o elemento atual pelos controles abaixo, existem 4 etapas</h1>
  </>
);
InitialImplementation.args = {
  step: 0,
} as Partial<React.ComponentProps<typeof Transition>>;
