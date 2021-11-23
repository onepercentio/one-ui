import React from "react";
import C from "./Text";

export default {
  component: C,
  title: "Variantes de texto",
};

export const Primary = (args: any) => <C {...args}>{args.exampleText}</C>;
Primary.args = {
  exampleText: "Texto de exemplo",
};
