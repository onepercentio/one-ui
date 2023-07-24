import React from "react";
import OneUIProvider from "../../context/OneUIProvider";
import MutableHamburgerButton from "../MutableHamburgerButton";
import Select, { SelectItem } from "./Select";
import Text from "../Text/Text";

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

export const FullSelect = () => {
  return (
    <InitialImplementation
      label="An example full of options"
      data-testid="full-example"
      items={new Array(1000).fill(undefined).map((_, i) => ({
        labelStr: `Option ${i}`,
        label: (
          <>
            <Text type="content">{`Option ${i}`}</Text>
            <Text type="caption">{`Subtitle ${i}`}</Text>
          </>
        ),
        value: String(i),
      }))}
      filter={(item: SelectItem, term: string) => {
        return "labelStr" in item && item.labelStr.includes(term);
      }}
    />
  );
};
