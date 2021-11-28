import React from "react";
import Transition from "./Transition";

export default {
  component: Transition,
  title: "Transitor de elementos",
};

export const InitialImplementation = (args: any) => (
  <Transition {...args}>
    <div>Elemento 1</div>
    <div>Elemento 2</div>
    <div>Elemento 3</div>
    <div>Elemento 4</div>
  </Transition>
);
InitialImplementation.args = {
  step: 0,
} as Partial<React.ComponentProps<typeof Transition>>;
