import React from "react";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import BaseText, { _Text } from "../Text/Text";
import Skeleton from "./Skeleton";

export default {
  component: Skeleton,
  title: "Skeleton",
};

export const InitialImplementation = (args: any) => <Skeleton {...args} />;
InitialImplementation.args = {
  height: 2,
  width: 8,
} as Partial<React.ComponentProps<typeof Skeleton>>;

export const SynergyTextAndCountdown = () => {
  const variants = extractAllPossibilitiesFromEnumProp(_Text, "type");

  return variants.map((type) => {
    return (
      <SideBySideContainer exampleName={`Checkbox com text type=${type}`}>
        <BaseText type={type}>
          <Skeleton width={10} height={3} />
        </BaseText>
      </SideBySideContainer>
    );
  });
};
