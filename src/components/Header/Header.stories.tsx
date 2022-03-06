import React from "react";
import OneUIProvider from "../../context/OneUIProvider";
import Header from "./Header";

export default {
  component: Header,
  title: "Header",
};

export const InitialImplementation = (args: any) => (
  <OneUIProvider
    config={{
      component: {
        header: {
          LogoImage: () => (
            <div
              style={{ color: "white", fontWeight: "bold", fontSize: "24px" }}
            >
              Example logo el
            </div>
          ),
          MoreOptions: () => <div>V</div>,
        },
      },
    }}
  >
    <Header {...args} />
  </OneUIProvider>
);
InitialImplementation.args = {
  user: {
    name: "Murilo Araujo",
  },
  options: [
    {
      label: "Dashboard",
      onClick: () => {},
    },
  ],
  moreOptions: [
    {
      label: "Option 1",
      onClick: () => {},
    },
  ],
} as Partial<React.ComponentProps<typeof Header>>;
