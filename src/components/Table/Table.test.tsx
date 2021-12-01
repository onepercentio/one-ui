import React from "react";
import { render } from "@testing-library/react";
import Table from ".";
import OneUIProvider from "../../context/OneUIProvider";

it("Should display the footer only when really pageable", () => {
  const wrapper = render(
    <OneUIProvider
      config={{
        component: {
          table: {
            controls: {},
          },
        },
      }}
    >
      <Table<{ id: string }>
        heading={{}}
        order={["id"]}
        items={[
          {
            id: "0",
          },
          {
            id: "1",
          },
          {
            id: "2",
          },
        ]}
        paginable={{
          currentPage: 1,
          togglePage: jest.fn(),
          totalItems: 3,
        }}
      />
    </OneUIProvider>
  );

  expect(wrapper.queryByTestId("controls")).toBeNull();
});
