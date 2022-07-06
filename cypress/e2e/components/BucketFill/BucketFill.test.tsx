import React from "react";
import { mount } from "cypress/react";

import { AutoFill as Component } from "../../../../src/components/BucketFill/BucketFill.stories";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return mount(<Component {...Component.args} />);
}

it.only("Should at least render :)", () => {
  renderScreen({});
});

it("Should adapt correctly when resizing the window");
it("Should fill until the defined step bounds");
