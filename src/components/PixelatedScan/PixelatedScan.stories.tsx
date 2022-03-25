import React from "react";
import PixelatedScan from "./PixelatedScan";

export default {
  component: PixelatedScan,
  title: "Pixelated Scan",
};

export const InitialImplementation = (args: any) => (
  <div
    style={{
      position: "relative",
      backgroundColor: "red",
      height: "441px",
      width: "300px",
    }}
  >
    <PixelatedScan {...args} />
  </div>
);

export const PreciseImplementation = (args: any) => (
  <div style={{ display: "flex" }}>
    <div
      style={{
        position: "relative",
        backgroundColor: "red",
        height: "500px",
        width: "250px",
      }}
    >
      <PixelatedScan squaresByLine={10} {...args} />
    </div>
    <div
      style={{
        position: "relative",
        backgroundColor: "red",
        height: "1000px",
        width: "250px",
      }}
    >
      <PixelatedScan squaresByLine={10} {...args} />
    </div>
  </div>
);
InitialImplementation.args = {
  squaresByLine: 10,
} as Partial<React.ComponentProps<typeof PixelatedScan>>;
