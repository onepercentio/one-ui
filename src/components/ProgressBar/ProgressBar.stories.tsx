import React, { useEffect, useState } from "react";
import ProgressBar from "./ProgressBar";

export default {
  component: ProgressBar,
  title: "Progress Bar",
};

export const InitialImplementation = (args: any) => <ProgressBar {...args} />;
export const Example = (args: any) => {
  const [s, ss] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      ss(Math.random() * 100);
    }, 500);
    return () => {
      clearInterval(t);
    };
  });
  return <ProgressBar size={48} progress={s} />;
};
InitialImplementation.args = { size: 48, progress: 33 } as Partial<
  React.ComponentProps<typeof ProgressBar>
>;
