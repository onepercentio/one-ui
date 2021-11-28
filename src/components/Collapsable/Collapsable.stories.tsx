import React from "react";
import Collapsable from "./Collapsable";

export default {
  component: Collapsable,
  title: "Collapsable",
};

export const InitialImplementation = (args: any) => (
  <div style={{ backgroundColor: "lightgreen" }}>
    <Collapsable {...args} />
  </div>
);
InitialImplementation.args = {
  title: "Example title",
  children: (
    <>
      <h1>H1</h1>
      <h2>H2</h2>
      <h3>H3</h3>
      <h4>H4</h4>
    </>
  ),
} as Partial<React.ComponentProps<typeof Collapsable>>;
export const FloatingContent = (args: any) => (
  <div style={{ backgroundColor: "lightgreen" }}>
    <Collapsable {...args} />
  </div>
);
FloatingContent.args = {
  ...InitialImplementation.args,
  mode: "float",
  open: true
} as typeof InitialImplementation.args;
