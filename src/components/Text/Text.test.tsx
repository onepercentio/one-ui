import React from "react";
import { render } from "@testing-library/react";

import Component from "./Text";

it("Should at least render :)", () => {
  render(<Component type="boldTitle" />);
});
