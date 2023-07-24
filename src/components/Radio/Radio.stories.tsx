import React, { ComponentProps } from "react";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import BaseText, { _Text } from "../Text/Text";
import Radio from "./Radio";

export default {
  title: Radio.name,
  component: Radio,
};

export const Primary = (args: any) => <Radio {...args} />;
Primary.args = {
  label: "Some example text",
  size: 120,
} as Partial<ComponentProps<typeof Radio>>;

export const SynergyTextAndCheckbox = (args: any) => {
  const variants = extractAllPossibilitiesFromEnumProp(_Text, "type");

  return variants.map((type) => {
    return (
      <SideBySideContainer exampleName={`Checkbox com text type=${type}`}>
        <BaseText type={type}>
          <Radio label={type} checked={Math.random() >= 0.5} {...args} />
        </BaseText>
      </SideBySideContainer>
    );
  });
};
