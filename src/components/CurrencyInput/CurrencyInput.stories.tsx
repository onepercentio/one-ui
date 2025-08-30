import React, { useState } from "react";
import { IntlProvider } from "react-intl";
import {
  extractAllPossibilitiesFromEnumProp,
  SideBySideContainer,
} from "../../storybookUtils";
import BaseText, { _Text } from "../Text/Text";
import CurrencyInput from "./CurrencyInput";

export default {
  component: CurrencyInput,
  title: "Currency Input",
};

export const InitialImplementation = (
  args: React.ComponentProps<typeof CurrencyInput>
) => {
  const [v, sv] = useState('')
  return <CurrencyInput {...args} onChange={sv} value={v} />
};
InitialImplementation.args = {
  locale: "pt-BR",
  currency: "BRL",
} as Partial<React.ComponentProps<typeof CurrencyInput>>;

