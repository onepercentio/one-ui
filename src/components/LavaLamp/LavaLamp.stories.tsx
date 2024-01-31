import React from "react";
import LavaLamp from "./v2/LavaLamp";
import StoriesStyles from "./LavaLamp.stories.module.scss";

export default {
  component: LavaLamp,
  title: "Lava Lamp",
};

export const InitialImplementation = (args: any) => (
  <LavaLamp {...args} className={StoriesStyles.container}>
    <h1 style={{ color: "blue" }}>Should have content</h1>
  </LavaLamp>
);
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof LavaLamp>
>;
