import React from "react";
import chroma from "chroma-js";
import StaticScroller from "./StaticScroller";

export default {
  component: StaticScroller,
  title: "Static Scroller",
};

export const InitialImplementation = (args: any) => (
  <StaticScroller {...args} data-testid="scroller">
    <div style={{ height: "400px", width: "25vw", backgroundColor: "red" }}>
      <span data-testid="text">Test</span>
    </div>
    {new Array(100).fill(undefined).map(() => {
      const c = chroma.random().hex();
      return (
        <button
          key={c}
          style={{ height: "400px", width: "10vw", backgroundColor: c }}
        />
      );
    })}
  </StaticScroller>
);
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof StaticScroller>
>;
