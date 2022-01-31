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
  items: [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
  ].map(String),
  pageSize: 3,
} as Partial<React.ComponentProps<typeof InfinityScroll>>;
