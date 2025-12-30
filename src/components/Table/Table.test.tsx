import React from "react";
import { render } from "@testing-library/react";
import Table from ".";
import OneUIProvider, { OneUIContextSpecs } from "../../context/OneUIProvider";

it("Should display the footer only when really pageable", () => {
  const wrapper = render(
    <OneUIProvider
      config={{
        component: {
          table: {
            controls: {},
          },
        },
      } as OneUIContextSpecs}
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
          togglePage: jest.fn(),
          totalItems: 3,
          pageSize: 5
        }}
      />
    </OneUIProvider>
  );

  expect(wrapper.queryByTestId("controls")).toBeNull();
});
