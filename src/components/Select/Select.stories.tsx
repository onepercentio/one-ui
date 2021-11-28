import React from "react";
import Select from "./Select";

export default {
  component: Select,
  title: "Select",
};

export const InitialImplementation = (args: any) => <Select {...args} />;
InitialImplementation.args = {
  items: [
    {
      label: "Example item",
      value: "",
    },
  ],
  label: "Example label",
} as Partial<React.ComponentProps<typeof Select>>;
