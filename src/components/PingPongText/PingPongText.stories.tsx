import React from "react";
import PingPongText from "./PingPongText";

export default {
  component: PingPongText,
  title: "Ping Pong Text",
};

export const InitialImplementation = (args: any) => (
  <div
    style={{
      width: 500,
      height: 500,
      background: "linear-gradient(135deg, red,green,blue)",
    }}
  >
    <PingPongText type="boldTitleBig">
      A small text that fits the width
    </PingPongText>
    <PingPongText type="boldTitleBig">
      <span style={{ whiteSpace: "nowrap" }}>
        This text otherwise has a width that should be overflowing this
        container and should not be able to be read without scrolling first so
        it needs to scroll slowly so people can read it
      </span>
    </PingPongText>
  </div>
);
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof PingPongText>
>;
