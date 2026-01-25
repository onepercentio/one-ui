import React from "react";
import C, { InputProps } from "./Input";

export default {
  component: C,
  title: "Input simples",
};

export const Primary = (args: InputProps) => <C {...args} />;
export const WithDecoration = (args: InputProps) => (
  <C {...args} decoration={<span>DECOR</span>} />
);

Primary.args = {
  disclaimer: "Some disclaimer info",
  error: "Some error that only shows when unfocused",
  autoFocus: true,
  hideError: "onfocus",
} as InputProps;
WithDecoration.args = Primary.args