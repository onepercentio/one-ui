import React from "react";
import { IntlProvider } from "react-intl";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import Text, { _Text } from "../Text/Text";
import Countdown from "./Countdown";

export default {
  component: Countdown,
  title: "Countdown",
};

export const InitialImplementation = (args: any) => (
  <IntlProvider locale="pt-br">
    <Countdown {...args} />
  </IntlProvider>
);
InitialImplementation.args = {
  timeRemaining: 1000 * 60 * 60 * 12, // 12 hours
} as Partial<React.ComponentProps<typeof Countdown>>;

export const SynergyTextAndCountdown = (args: any) => {
  const variants = extractAllPossibilitiesFromEnumProp(_Text, "type");

  return variants.map((type) => {
    return (
      <IntlProvider locale="pt-br">
        <SideBySideContainer exampleName={`Checkbox com text type=${type}`}>
          <Text type={type}>
            <Countdown
              timeRemaining={
                1000 * 60 * 60 * 12 - Math.random() * 1000 * 60 * 60 * 3
              }
            />
          </Text>
        </SideBySideContainer>
      </IntlProvider>
    );
  });
};
