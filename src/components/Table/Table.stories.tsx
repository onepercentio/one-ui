import React, { useState } from "react";
import Table, { TableProps } from "./Table";

export default {
  component: Table,
  title: "Table",
};

export const Paginable = (args: any) => {
  const [page, setPage] = useState(1);

  return (
    <div style={{ backgroundColor: "lightgray" }}>
      <Table
        {...args}
        paginable={{
          currentPage: page,
          totalItems: args.items.length,
          togglePage: setPage,
        }}
      />
    </div>
  );
};

function PreffixObj(preffix: string) {
  return {
    label1: preffix + " example 1",
    label2: preffix + " example 2",
    label3: preffix + " example 3",
    label4: preffix + " example 4'",
  };
}

function Group(page: number) {
  return [
    PreffixObj(page + " First"),
    PreffixObj(page + " Second"),
    PreffixObj(page + " Third"),
    PreffixObj(page + " Fourth"),
    PreffixObj(page + " Fifth"),
  ];
}

Paginable.args = {
  heading: {
    label1: "Label 1",
    label2: "Label 2",
    label3: "Label 3",
  },
  order: ["label2", "label1", "label3", "label4"],
  items: [...Group(1), ...Group(2), ...Group(3)],
  paginable: {
    currentPage: 1,
    totalItems: 100,
  },
} as Partial<
  TableProps<{
    label1: string;
    label2: string;
    label3: string;
    label4: string;
  }>
>;
