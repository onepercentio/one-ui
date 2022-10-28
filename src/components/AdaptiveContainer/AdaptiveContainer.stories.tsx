import React, { useEffect, useMemo, useState } from "react";
import Button from "../Button";
import Loader from "../Loader";
import MutableHamburgerButton from "../MutableHamburgerButton";
import Tabs from "../Tabs";
import Text from "../Text";
import AdaptiveContainer from "./AdaptiveContainer";

export default {
  component: AdaptiveContainer,
  title: "Adaptive Container",
};

export const InitialImplementation = (args: any) => (
  <AdaptiveContainer {...args} />
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
      <AdaptiveContainer containerElement={Button} variant="outline">
        {child}
      </AdaptiveContainer>
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
} as Partial<React.ComponentProps<typeof AdaptiveContainer>>;
