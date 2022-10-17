import React, { ComponentProps, createRef, ElementRef } from "react";
import { act, render } from "@testing-library/react";

import Component from "./WalletConnectionWrapper";
import { WaitTimeout } from "../../__test__/utils";

const ProviderMock = jest.spyOn(require("use-wallet"), "UseWalletProvider");
const useWalletMock = jest
  .spyOn(require("use-wallet"), "useWallet")
  .mockImplementation(() => ({})) as jest.Mocked<
  typeof import("use-wallet")
>["useWallet"];
const MockContent = () => null;
const defaultProps: any = {
  Content: MockContent,
};

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.removeItem("auto_connect");
});

it("Should auto connect the connection after the user connects", async () => {
  const connectCb = jest.fn(() => {});
  useWalletMock.mockImplementation(() => ({
    isConnected: () => false,
    connect: connectCb,
    reset: () => {},
    ...({} as any),
  }));
  global.window.ethereum = {} as any;
  function getAutoConnectFlag() {
    return !!localStorage.getItem("auto_connect");
  }
  expect(getAutoConnectFlag()).toBeFalsy();
  const ref = createRef<ElementRef<typeof Component>>();
  render(<Component ref={ref} {...defaultProps} />);
  expect(ProviderMock).toHaveBeenCalledTimes(1);
  await act(async () => {
    await ref.current!.connect();
  });
  expect(connectCb).toHaveBeenCalledTimes(1);

  render(<Component ref={ref} {...defaultProps} />);
  await act(() => WaitTimeout(100));
  expect(ProviderMock).toHaveBeenCalledTimes(2);
  expect(getAutoConnectFlag()).toBeTruthy();
  expect(connectCb).toHaveBeenCalledTimes(2);
  ref.current!.disconnect();

  render(<Component ref={ref} {...defaultProps} />);
  expect(ProviderMock).toHaveBeenCalledTimes(3);
  expect(getAutoConnectFlag()).toBeFalsy();
  expect(connectCb).toHaveBeenCalledTimes(2);
});
it("Should warn when there is no provider available", () => {
  useWalletMock.mockImplementation(() => ({
    isConnected: () => false,
    ...({} as any),
  }));
  delete window.ethereum;
  const { container } = render(
    <Component
      ProviderUnavailable={() => <h1>Provider unavailable</h1>}
      {...defaultProps}
    />
  );
  expect(container.textContent).toEqual("Provider unavailable");

  window.ethereum = {} as any;
  const { container: continer2 } = render(
    <Component
      ProviderUnavailable={() => <h1>Provider unavailable</h1>}
      {...defaultProps}
    />
  );
  expect(continer2.textContent).not.toEqual("Provider unavailable");
});
it("Should warn when the chainId is not the correct one", () => {
  const requestMock = jest.fn();
  window.ethereum = {
    request: requestMock,
  } as any;
  useWalletMock.mockImplementation(() => ({
    chainId: 56,
    isConnected: () => true,
    ...({} as any),
  }));
  const { container } = render(
    <Component
      allowedChainId={56}
      ChainIdInvalid={() => <h1>Invalid</h1>}
      {...defaultProps}
    />
  );
  expect(container.textContent).not.toContain("Invalid");

  const resetMock = jest.fn();
  const connectMock = jest.fn();
  useWalletMock.mockImplementation(() => ({
    chainId: "UNEXPECTED",
    reset: resetMock,
    connect: connectMock,
    isConnected: () => true,
    ...({} as any),
  }));
  const ui = jest.fn(({ changeChainId }: { changeChainId: () => void }) => (
    <h1>Invalid</h1>
  ));
  const { container: container2 } = render(
    <Component allowedChainId={56} ChainIdInvalid={ui} {...defaultProps} />
  );
  expect(container2.textContent).toContain("Invalid");

  // When the user clicks the change chain
  ui.mock.calls.slice(-1)[0][0].changeChainId();

  expect(resetMock).toHaveBeenCalled();
  expect(connectMock).toHaveBeenCalled();
  expect(requestMock).toHaveBeenCalledWith({
    method: "wallet_switchEthereumChain",
    params: [
      {
        chainId: `0x38`,
      },
    ],
  });
});
it("Should warn when the connection fails", async () => {
  useWalletMock.mockImplementation(() => ({
    chainId: "UNEXPECTED",
    isConnected: () => false,
    connect: () => Promise.reject(),
    ...({} as any),
  }));

  window.ethereum = {} as any;

  const ref = createRef<ElementRef<typeof Component>>();
  const mockComp = jest.fn<
    string,
    [ComponentProps<ComponentProps<typeof Component>["Content"]>]
  >((props) => (props.error ? "Error" : props.loading ? "Loading" : "OK"));

  const { findByText } = render(
    <Component ref={ref} {...defaultProps} Content={mockComp} />
  );
  act(() => {
    ref.current!.connect();
  });

  await findByText("Error");
});

// This cenario is given by the useWallet hook .isConnected()
//it("Should notify when the user connects", () => {});

describe("BUGFIX", () => {
  it("Should not validate chainId if not connected yet", () => {
    window.ethereum = {} as any;
    useWalletMock.mockImplementation(() => ({
      chainId: undefined,
      isConnected: () => false,
      ...({} as any),
    }));
    const { container, findByText } = render(
      <Component
        allowedChainId={90}
        ChainIdInvalid={() => <p>Invalid</p>}
        {...defaultProps}
      />
    );

    expect(container.textContent).not.toContain("Invalid");
  });
});
