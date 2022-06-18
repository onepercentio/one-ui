import React, { useEffect, useMemo, useState } from "react";
import Loader from "../Loader";
import MutableHamburgerButton from "../MutableHamburgerButton";
import Tabs from "../Tabs";
import Text from "../Text";
import AdaptiveButton from "./AdaptiveButton";

export default {
  component: AdaptiveButton,
  title: "Adaptive Button",
};

export const InitialImplementation = (args: any) => (
  <AdaptiveButton {...args} />
);
enum Example {
  Loading,
  Error,
  Content,
  Success,
}
export const TargetUsage = () => {
  const [s, ss] = useState<Example>(Example.Error);

  const child = useMemo(() => {
    switch (s) {
      case Example.Content:
        return <React.Fragment key={s}>Example button</React.Fragment>;
      case Example.Error:
        return <MutableHamburgerButton key={s} size={24} state={"closed"} />;
      case Example.Success:
        return <MutableHamburgerButton key={s} size={24} state={"arrow-up"} />;
      case Example.Loading:
        return <Loader key={s} />;
    }
  }, [s]);

  useEffect(() => {
    setInterval(() => {
      //   ss((pv) => (pv === 3 ? 0 : pv + 1));
    }, 10000);
  }, []);

  return (
    <>
      <Tabs
        options={Object.keys(Example)
          .map((k) => ({
            id: Example[k as any],
            label: k,
          }))
          .filter((e) => parseInt(e.id, 10) >= 0)}
        onSelect={ss as any}
        selected={s as any}
      />
      <AdaptiveButton variant="outline">{child}</AdaptiveButton>
    </>
  );
};
InitialImplementation.args = {
  variant: "filled",
  children: (
    <Text key="example" type="highlight">
      Some content to the button
    </Text>
  ),
} as Partial<React.ComponentProps<typeof AdaptiveButton>>;
