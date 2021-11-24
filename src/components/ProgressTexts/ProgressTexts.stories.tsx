import React, { ComponentProps } from "react";
import C from "./ProgressTexts";

export default {
  component: C,
  title: "Drawer de etapas",
};

export const Primary = (args: any) => <C {...args} />;
Primary.args = {
  currentStep: 0,
  steps: [
    {
      title: "Titulo 1",
      type: "final",
    },
    {
      title: "Titulo 2",
      type: "final",
    },
  ],
} as Partial<ComponentProps<typeof C>>;
