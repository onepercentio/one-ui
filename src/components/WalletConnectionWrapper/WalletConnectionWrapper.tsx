import React, {
  createRef,
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useWallet, UseWalletProvider } from "use-wallet";
import useAsyncControl from "../../hooks/useAsyncControl";

export type WalletConnectionProps = Omit<
  ReturnType<typeof useAsyncControl>,
  "process"
> & {
  isChainIdValid: boolean;
  isProviderAvailable: boolean;
  connect: () => void;
  disconnect: () => void;
  changeChainId: () => void;
};

type Props = {
  /**
   * The chain id that the user is expected to connect to
   */
  allowedChainId: number;

  /**
   * When the user doesn't have a provider like metamask available
   */
  ProviderUnavailable?: React.FunctionComponent;

  /**
   * This is invoked when the chain ID is not available
   */
  ChainIdInvalid?: React.FunctionComponent<{
    changeChainId: () => void;
  }>;

  /**
   * This renders the content that is shown inside the wallet content
   */
  Content: React.FunctionComponent<WalletConnectionProps>;
};

/**
 * This component handles a lot of cenarios when dealing with the wallet connection to different providers (ex: Metamask)
 **/
function WalletConnectionWrapper(
  props: Props,
  ref: ForwardedRef<{
    connect: () => Promise<void>;
    disconnect: () => void;
  }>
) {
  return (
    <UseWalletProvider>
      <Content compRef={ref || createRef()} {...props} />
    </UseWalletProvider>
  );
}

function Content({
  ProviderUnavailable,
  ChainIdInvalid,
  allowedChainId,
  Content,
  compRef,
}: Props & {
  compRef: ForwardedRef<{
    connect: () => Promise<void>;
    disconnect: () => void;
  }>;
}) {
  const wallet = useWallet();
  const connectionAsyncWrapper = useAsyncControl();
  const connect = async () => {
    connectionAsyncWrapper.process(async () => {
      await wallet.connect("injected");
      localStorage.setItem("auto_connect", "true");
    });
  };
  const disconnect = () => {
    wallet.reset();
    localStorage.removeItem("auto_connect");
  };
  useEffect(() => {
    const autoConnect = !!localStorage.getItem("auto_connect");
    if (autoConnect) connect();
  }, []);
  useImperativeHandle(
    compRef,
    () => ({
      connect,
      disconnect,
    }),
    [wallet]
  );
  const [isProviderAvailable] = useState(() => !!window.ethereum);
  const isChainIdValid = useMemo(
    () => (wallet.isConnected() ? wallet.chainId === allowedChainId : true),
    [wallet, allowedChainId]
  );

  function changeChainId() {
    wallet.reset();
    window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [
        {
          chainId: `0x${allowedChainId.toString(16).padStart(2, "0")}`,
        },
      ],
    });
    wallet.connect("injected");
  }
  return (
    <>
      {ProviderUnavailable && !isProviderAvailable && <ProviderUnavailable />}
      {ChainIdInvalid && !isChainIdValid && (
        <ChainIdInvalid changeChainId={changeChainId} />
      )}
      {
        <Content
          {...connectionAsyncWrapper}
          isChainIdValid={isChainIdValid}
          isProviderAvailable={isProviderAvailable}
          connect={connect}
          disconnect={disconnect}
          changeChainId={changeChainId}
        />
      }
    </>
  );
}

export default forwardRef(WalletConnectionWrapper);
