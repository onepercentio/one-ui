import React, { ComponentProps, useState } from "react";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import BaseText, { _Text } from "../Text/Text";
import Radio from "./Radio";
import OneUIProvider from "../../context/OneUIProvider";
import { Generic } from "./variants/Generic";

export default {
  title: "Radio",
  component: Radio,
};

export const Primary = (args: any) => <Radio {...args} />;
Primary.args = {
  label: "Some example text",
  size: 120,
} as Partial<ComponentProps<typeof Radio>>;

export const SynergyTextAndCheckbox = (args: any) => {
  const variants = extractAllPossibilitiesFromEnumProp(_Text, "type", [
    "boldTitle",
    "boldTitleBig",
  ]);

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

export const Variants = (args: any) => {
  const [s, ss] = useState(false)
  return (
    <>
      <h1>Variant default</h1>
      <Radio
        label={"THIS IS A LABEL"}
        checked={s}
        onToggle={ss}
        {...args}
      />
      <h1>Variant generic</h1>
      <OneUIProvider config={{ component: { radio: { Component: Generic } } }}>
        <Radio
          label={"THIS IS A LABEL"}
          checked={s}
          onToggle={ss}
          {...args}
        />
      </OneUIProvider>
    </>
  );
};

Variants.args = Primary.args;
