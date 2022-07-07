import React from "react";
import { mount } from "cypress/react";

import { InitialImplementation as Component } from "../../../../src/components/AsyncProcessQueue/AsyncProcessQueue.stories";

function renderScreen(props: React.ComponentProps<typeof Component>) {
  return mount(<Component {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({});
});

it.only("Should animate the component from UI to queue Element");
it("Should be able to list process in queue");
it("Should be able to cancel a process in queue");
it("Should be able to retry a process in queue");
