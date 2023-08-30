import React, { useState } from "react";
import Switch from "./Switch";

export default {
  component: Switch,
  title: "Switch",
};

export const InitialImplementation = (args: any) => {
  const [t, st] = useState(false);
  return <Switch {...args} onToggle={st} enabled={t} />;
};
InitialImplementation.args = {} as Partial<React.ComponentProps<typeof Switch>>;
