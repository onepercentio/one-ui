import { ComponentProps } from "react";

let MockedProvider!: ComponentProps<
  typeof import("../OneUIProvider")["default"]
>["config"];

export function useOneUIContext() {
  return MockedProvider;
}

export function setupMock(
  ctx: ComponentProps<typeof import("../OneUIProvider")["default"]>["config"]
) {
  MockedProvider = ctx;
}
