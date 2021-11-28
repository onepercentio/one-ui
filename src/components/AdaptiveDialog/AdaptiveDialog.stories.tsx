import React from "react";
import AdaptiveDialog from "./AdaptiveDialog";

export default {
  component: AdaptiveDialog,
  title: "Adaptive Dialog",
};

export const InitialImplementation = (args: any) => (
  <AdaptiveDialog {...args}>
      <p>Some content</p>
      <h1>ANs some more</h1>
      <h1>ANs some more</h1>
      <h1>ANs some more</h1>
      <h1>ANs some more</h1>
      <h1>ANs some more</h1>
      <h1>ANs some more</h1>
      <h1>ANs some more</h1>
  </AdaptiveDialog>
);
InitialImplementation.args = {
  open: true,
} as Partial<React.ComponentProps<typeof AdaptiveDialog>>;
