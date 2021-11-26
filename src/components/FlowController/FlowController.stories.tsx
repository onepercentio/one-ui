import React, { ComponentProps } from "react";
import C from "./FlowController";

export default {
  component: C,
  title: "Fluxo de etapas",
};

export const Primary = (args: any) => <C {...args} />;
Primary.args = {
  step: 3,
  children: [
    <div>Etapa 1</div>,
    <div>Etapa 2</div>,
    <div>Etapa 3</div>,
    <div>Etapa 4</div>,
    <div>Etapa 5</div>,
    <div>Etapa 6</div>,
    <div>Etapa 7</div>,
    <div>Etapa 8</div>,
  ],
  buttons: [{
    label: "Action",
    onClick: () => {},
    state: "enabled"
  }, {
    label: "Action disabled",
    onClick: () => {},
    state: "disabled"
  }],
} as Partial<ComponentProps<typeof C>>;
