import React, { ComponentProps } from "react";
import Parallax from "./Parallax";

export default {
  title: "Parallax",
  component: Parallax,
};

export const InitialImplementation = (args: any) => {
  return (
    <Parallax {...args}>
      <div>
        <h1>This is a parallax component</h1>
        <p>
          It should emulate movement when moving the screen on mobile or
          hovering the mouse on desktop
        </p>
      </div>
    </Parallax>
  );
};
InitialImplementation.args = {
  active: true,
} as Partial<ComponentProps<typeof Parallax>>;
