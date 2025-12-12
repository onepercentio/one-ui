import React, { useState } from "react";
import { IntlProvider } from "react-intl";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import BaseText, { _Text } from "../Text/Text";
import Countdown from "./Countdown";

export default {
  component: Countdown,
  title: "Countdown",
};

export const InitialImplementation = (
  args: React.ComponentProps<typeof Countdown>
) => (
  <IntlProvider locale="pt-br">
    <Countdown {...args} />
  </IntlProvider>
);
InitialImplementation.args = {
  timeRemaining: 1000 * 60 * 60 * 12, // 12 hours
} as Partial<React.ComponentProps<typeof Countdown>>;

export const FinishCallback = (
  args: React.ComponentProps<typeof Countdown>
) => {
  const [finished, setFinished] = useState(false);
  return (
    <IntlProvider locale="pt-br">
      <h1>Finished {String(finished)}</h1>
      <Countdown {...args} onFinish={() => setFinished(true)} />
    </IntlProvider>
  );
};
FinishCallback.args = {
  timeRemaining: 1000 * 9.5,
} as Partial<React.ComponentProps<typeof Countdown>>;

export const SynergyTextAndCountdown = (args: any) => {
  const variants = extractAllPossibilitiesFromEnumProp(_Text, "type");

  return variants.map((type) => {
    return (
      <IntlProvider locale="pt-br">
        <SideBySideContainer exampleName={`Checkbox com text type=${type}`}>
          <BaseText type={type}>
            <Countdown
              timeRemaining={
                1000 * 60 * 60 * 12 - Math.random() * 1000 * 60 * 60 * 3
              }
            />
          </BaseText>
        </SideBySideContainer>
      </IntlProvider>
    );
  });
};
