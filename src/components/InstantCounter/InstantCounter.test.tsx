import React from "react";
import { findByText, render } from "@testing-library/react";

import Component from "./InstantCounter";
import { IntlProvider } from "react-intl";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return render(
    <IntlProvider locale="pt-br">
      <Component {...props} />
    </IntlProvider>
  );
}

it("Should count based on number of frames and time to final count", async () => {
  const wrapper = renderScreen({
    to: 1000000,
    framesPerSecond: 2,
    durationInSeconds: 2,
    formatOptions: {
      minimumIntegerDigits: 7,
    },
  });

  await wrapper.findByText("0.000.000");
  await wrapper.findByText("0.250.000");
  await wrapper.findByText("0.500.000");
  await wrapper.findByText("0.750.000");
  await wrapper.findByText("1.000.000");
});

it("Should work for these cenarios", async () => {
  const wrapper = renderScreen({
    to: 245997444,
    durationInSeconds: 2,
    formatOptions: {
      minimumIntegerDigits: 9,
    },
  });

  await wrapper.findByText(
    "245.997.444",
    {},
    {
      timeout: 5000,
    }
  );
});
