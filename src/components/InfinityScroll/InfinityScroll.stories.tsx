import React, { createRef } from "react";
import InfinityScroll from "./InfinityScroll";

export default {
  component: InfinityScroll,
  title: "Infinity Scroll",
};

export const InitialImplementation = (args: any) => (
  <InfinityScroll ref={createRef()} {...args} />
);
InitialImplementation.args = {
  items: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d"].map(
    String
  ),
  pageSize: 3,
} as Partial<React.ComponentProps<typeof InfinityScroll>>;

export const BugFixScrollWith4Items = () => {
  function H1(txt: string) {
    return (
      <h1
        style={{
          backgroundColor: `rgb(${Math.random() * 255}, ${
            Math.random() * 255
          }, ${Math.random() * 255})`,
          minHeight: "450px",
          display: "inline-block",
          width: "33%",
        }}
      >
        {txt}
      </h1>
    );
  }
  return (
    <InfinityScroll
      ref={createRef()}
      items={["1", "2", "3", "4"].map(H1)}
      pageSize={3}
      initialPage={1}
    />
  );
};
