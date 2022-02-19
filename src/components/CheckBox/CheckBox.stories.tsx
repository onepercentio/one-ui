import React, { ComponentProps } from "react";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import Text from "../Text";
import CheckBox from "./CheckBox";

export default {
  title: CheckBox.name,
  component: CheckBox,
};

export const Primary = (args: any) => <CheckBox {...args} />;
Primary.args = {
  label: "Some example text",
  size: 120,
} as Partial<ComponentProps<typeof CheckBox>>;

export const SynergyTextAndCheckbox = (args: any) => {
  const variants = extractAllPossibilitiesFromEnumProp(Text, "type");

  return variants.map((type) => {
    return (
      <SideBySideContainer exampleName={`Checkbox com text type=${type}`}>
        <Text type={type}>
          <CheckBox label={type} checked={Math.random() >= 0.5} {...args} />
        </Text>
      </SideBySideContainer>
    );
  });
};
