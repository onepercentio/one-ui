import React from "react";
import Transition from "./Transition";

export default {
  component: Transition,
  title: "Transitor de elementos",
};

export const InitialImplementation = (args: any) => (
  <Transition {...args}>
    <div key={0}>Elemento 1</div>
    <div key={1}>Elemento 2</div>
    <div key={2}>Elemento 3</div>
    <div key={3}>Elemento 4</div>
  </Transition>
);
InitialImplementation.args = {
  step: 0,
} as Partial<React.ComponentProps<typeof Transition>>;
