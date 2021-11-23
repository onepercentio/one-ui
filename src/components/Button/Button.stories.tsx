import React from "react";
import Comp from ".";

export default {
  component: Comp,
  title: "Botão",
};

export const Primary = (args: React.ComponentProps<typeof Comp>) => (
  <Comp {...args}>Um simples botão</Comp>
);
