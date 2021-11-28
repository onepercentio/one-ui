import React from "react";
import { render } from "@testing-library/react";
import * as Hook from "../../context/OneUIProvider";
import Header from "./Header";

jest.mock("../../context/OneUIProvider");
const MockedHook = (Hook as unknown) as typeof import("../../context/__mocks__/OneUIProvider");
MockedHook.setupMock({
  component: { header: { LogoImage: () => <div data-testid="logo-img" /> } },
});

function renderScreen(props: React.ComponentProps<typeof Header>) {
  return render(<Header {...props} />);
}

it("Should at least render :)", () => {
  renderScreen({ moreOptions: [], options: [] });
});

it.each([
  [true, "/some/path/profile.png"],
  [true, undefined],
  [false, undefined],
] as const)(
  "Should display the profile data correctly 'when there is a user' = %s, 'the profile picture is' = %s and",
  (shouldHaveABasicUser, profileUrl) => {
    const wrapper = renderScreen({
      user: shouldHaveABasicUser
        ? {
            name: "Mocked user",
            profilePicture: profileUrl,
          }
        : undefined,
      moreOptions: [],
      options: [],
    });

    const el = wrapper.queryByTestId("profile-container");

    if (shouldHaveABasicUser)
      expect(wrapper.container.textContent).toContain("Mocked user");
    if (!shouldHaveABasicUser) {
      expect(el).toBeNull();
    } else if (profileUrl) {
      expect(el?.tagName).toBe("IMG");
      expect(el?.getAttribute("src")).toBe(profileUrl);
    } else {
      expect(el?.tagName).toBe("DIV");
      expect(el?.textContent).toBe("MU");
    }
  }
);

it("Should trigger the option click when interacted", () => {
  const cb = jest.fn();
  const wrapper = renderScreen({
    options: [
      {
        label: "One option",
        onClick: cb,
      },
    ],
    moreOptions: [],
  });

  expect(cb).toHaveBeenCalledTimes(0);

  wrapper.getByTestId("option-0").click();

  expect(cb).toHaveBeenCalledTimes(1);
});

it.each([true, false])(
  "Should show more options only when provided = %s",
  (providedMoreOptions) => {
    const wrapper = renderScreen({
      options: [],
      moreOptions: providedMoreOptions ? [] : undefined,
    });
    const el = wrapper.queryByTestId("more-options-container");

    if (providedMoreOptions) expect(el).not.toBeNull();
    else expect(el).toBeNull();
  }
);
