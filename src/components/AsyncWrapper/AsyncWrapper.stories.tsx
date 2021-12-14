import React from "react";
import OneUIProvider from "../../context/OneUIProvider";
import Loader from "../Loader";
import AsyncWrapper from "./AsyncWrapper";

export default {
  component: AsyncWrapper,
  title: "Async Wrapper",
};

export const InitialImplementation = (args: any) => (
  <OneUIProvider
    config={{
      component: {
        asyncWrapper: {
          LoadingComponent: () => <Loader />,
          messages: {
            error: {
              title: "Exemplo de error",
              retryBtn: "Tentar novamente",
            },
          },
        },
      },
    }}
  >
    <AsyncWrapper {...args} />
  </OneUIProvider>
);
InitialImplementation.args = {
    loading: true,
    error: false
} as Partial<
  React.ComponentProps<typeof AsyncWrapper>
>;
