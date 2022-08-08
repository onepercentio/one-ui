import React, { ComponentProps, useEffect, useState } from "react";
import MutableHamburgerButton from "./MutableHamburgerButton";

export default {
  component: MutableHamburgerButton,
  title: "Mutable Hamburger Button",
};

export const InitialImplementation = (args: any) => (
  <div style={{transformOrigin: '0px 0px',transform: "scale(10)", backgroundColor: "#00f5", display: "inline-block"}}>
    <MutableHamburgerButton {...args} />
  </div>
);
InitialImplementation.args = {
  size: window.screen.availHeight * 0.4,
} as Partial<React.ComponentProps<typeof MutableHamburgerButton>>;

export const TransitionToLoader = (args: any) => {
  const [s, ss] =
    useState<ComponentProps<typeof MutableHamburgerButton>["state"]>("closed");

    function randomState(): typeof s {
        const r = Math.random();
        if (r < 0.2) {
            return "default"
        } else if (r < 0.4) {
            return "arrow-down"
        } else if (r < 0.6) {
            return "arrow-up"
        } else if (r < 0.8) {
            return "closed";
        } else {
            return "search"
        }
    }

  useEffect(() => {
    const o = setInterval(() => {
      ss((p) => (p !== "loading" ? "loading" : randomState()));
    }, 500);

    return () => clearInterval(o);
  });
  return <MutableHamburgerButton {...args} state={s} />;
};
TransitionToLoader.args = {
  size: window.screen.availHeight * 0.4,
} as Partial<React.ComponentProps<typeof MutableHamburgerButton>>;
