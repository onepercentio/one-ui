import React, { ComponentProps, useState } from "react";
import Tabs from "./Tabs";

export default {
  title: "Tabs",
  component: Tabs,
};

export const InitialImplementation = (args: any) => {
  const [s, ss] = useState();

  return <Tabs {...args} onSelect={ss} selected={s} />;
};
InitialImplementation.args = {
  options: [
    {
      id: "1",
      label: "Primeira opção",
    },
    {
      id: "2",
      label: "Segunda opção",
    },
    {
      id: "3",
      label: "Terceira opção",
    },
  ],
} as Partial<ComponentProps<typeof Tabs>>;
