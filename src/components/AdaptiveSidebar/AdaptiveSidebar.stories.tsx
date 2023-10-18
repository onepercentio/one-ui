import React from "react";
import AdaptiveSidebar from "./AdaptiveSidebar";
import Sample from "./AdaptiveSidebar.sample";

export default {
  component: AdaptiveSidebar,
  title: "Adaptive Sidebar",
};

export const InitialImplementation = (args: any) => (
  <AdaptiveSidebar {...args}>
    <div style={{ backgroundColor: "yellow" }}>
      <h1 style={{ margin: 0 }}>Um sidebar heading</h1>
      {new Array(100).fill(undefined).map((_, i) => (
        <p>Opção {i}</p>
      ))}
    </div>
  </AdaptiveSidebar>
);
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof AdaptiveSidebar>
>;

export const OneSuggests_ExampleSample = Sample;
