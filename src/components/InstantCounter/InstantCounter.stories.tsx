import React from 'react';
import { IntlProvider } from 'react-intl';
import { extractAllPossibilitiesFromEnumProp, SideBySideContainer } from '../../storybookUtils';
import BaseText, { Text } from '../Text/Text';
import InstantCounter from "./InstantCounter";
    
export default {
    component: InstantCounter,
    title: "Instant Counter"
}

export const InitialImplementation = (args: any) => <IntlProvider locale='pt-br'>
    <InstantCounter {...args}/>
</IntlProvider>;

export const SynergyTextAndCountdown = (args: any) => {
  const variants = extractAllPossibilitiesFromEnumProp(Text, "type");

  return variants.map((type) => {
    return (
      <IntlProvider locale="pt-br">
        <SideBySideContainer exampleName={`Checkbox com text type=${type}`}>
          <BaseText type={type}>
            <InstantCounter {...args}/>
          </BaseText>
        </SideBySideContainer>
      </IntlProvider>
    );
  });
};
InitialImplementation.args = {
    framesPerSecond: 60,
    durationInSeconds: 2,
    formatOptions: {
        maximumFractionDigits: 0
    },
    to: 186124786
} as Partial<React.ComponentProps<typeof InstantCounter>>
SynergyTextAndCountdown.args = InitialImplementation.args