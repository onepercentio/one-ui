import React, { useRef, useState } from "react";
import AnchoredTooltip from "./AnchoredTooltip";

export default {
  component: AnchoredTooltip,
  title: "Anchored Tooltip",
};

export const InitialImplementation = (args: any) => {
  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);
  const [open4, setOpen4] = useState(false);
  const elementRef = useRef<HTMLHeadingElement>(null);
  const elementRef2 = useRef<HTMLHeadingElement>(null);
  const elementRef3 = useRef<HTMLHeadingElement>(null);
  const elementRef4 = useRef<HTMLHeadingElement>(null);
  return (
    <>
      <div
        data-testid="viewport"
        style={{
          width: "200vw",
          height: "100vh",
          backgroundColor: "lightblue",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "200vh",
          flexDirection: "column",
        }}
      >
        <h1
          ref={elementRef}
          style={{
            width: "200px",
            height: "200px",
            backgroundColor: "lightyellow",
          }}
          onClick={() => setOpen((a) => !a)}
        >
          Element to anchor to
          <br />
          Click to open tooltip
        </h1>
        <h1
          ref={elementRef3}
          style={{
            alignSelf: "flex-end",
          }}
          onClick={() => setOpen3((a) => !a)}
        >
          This one is aligned right
        </h1>
        <AnchoredTooltip anchorRef={elementRef3} open={open3}>
          <h1 style={{ maxWidth: "1000px", margin: "0px" }}>
            This content will overflow the available width of the screen so it
            needs to go to the left side so all the content can be visible by
            the user currently watching the screen and interacting with the
            elements available
          </h1>
        </AnchoredTooltip>
        <h1
          ref={elementRef4}
          style={{
            alignSelf: "flex-start",
          }}
          onClick={() => setOpen4((a) => !a)}
        >
          This one is aligned left
        </h1>
        <AnchoredTooltip anchorRef={elementRef4} open={open4}>
          <h1 style={{ maxWidth: "1000px", margin: "0px" }}>
            This content will overflow the available width of the screen so it
            needs to go to the right side so all the content can be visible by
            the user currently watching the screen and interacting with the
            elements available
          </h1>
        </AnchoredTooltip>
        <AnchoredTooltip anchorRef={elementRef} open={open}>
          <div style={{ color: "white" }}>
            The content of the tooltip
            <br />
            <div>
              <h1 style={{ margin: 0 }}>Some extra content</h1>
            </div>
          </div>
        </AnchoredTooltip>
      </div>
      <h1 ref={elementRef2} onClick={() => setOpen2((a) => !a)}>
        Another tooltip to show
      </h1>
      <AnchoredTooltip open={open2} anchorRef={elementRef2}>
        <h1 style={{ margin: 0 }}>Another tooltip</h1>
      </AnchoredTooltip>
    </>
  );
};
InitialImplementation.args = {} as Partial<
  React.ComponentProps<typeof AnchoredTooltip>
>;
