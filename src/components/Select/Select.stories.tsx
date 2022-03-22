import React from "react";
import OneUIProvider from "../../context/OneUIProvider";
import MutableHamburgerButton from "../MutableHamburgerButton";
import Select from "./Select";

export default {
  component: Select,
  title: "Select",
};

export const InitialImplementation = (args: any) => (
  <OneUIProvider
    config={{
      component: {
        select: {
          StateIndicator: ({ open }) => (
            <>
              <MutableHamburgerButton
                state={!open ? "arrow-down" : "arrow-up"}
                size={24}
              />
            </>
          ),
        },
      },
    }}
  >
    <Select {...args} />
  </OneUIProvider>
);
InitialImplementation.args = {
  items: [
    {
      label: "Example item",
      value: "",
    },
  ],
  label: "Example label",
} as Partial<React.ComponentProps<typeof Select>>;
