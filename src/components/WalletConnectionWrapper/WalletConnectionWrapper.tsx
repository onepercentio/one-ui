import React, {
  createRef,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useWallet, UseWalletProvider } from "use-wallet";
import useAsyncControl from "../../hooks/useAsyncControl";

export type WalletConnectionProps = PropsWithChildren<
  Omit<ReturnType<typeof useAsyncControl>, "process"> & {
    chainId?: number;
    isChainIdValid: boolean;
    isProviderAvailable: boolean;
    isConnectedAndValidChain: boolean;
    isConnected: boolean;
    wallet?: string;

    connect: () => void;
    disconnect: () => void;
    changeChainId: () => void;
  }
>;

type Props = {
  /**
   * The chain id that the user is expected to connect to
   */
  chain: {
    id: number;
    rpcUrl: string;
    explorerUrl: string;
    name: string;
    currency: string;
  };

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
  Content: (props: WalletConnectionProps) => ReactElement;
};

/**
 * This component handles a lot of cenarios when dealing with the wallet connection to different providers (ex: Metamask)
 **/
function WalletConnectionWrapper(
  props: PropsWithChildren<Props>,
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
/**
 * This component handles a lot of cenarios when dealing with the wallet connection to different providers (ex: Metamask)
 **/
function _BaseWalletConnectionWrapper(
  props: PropsWithChildren<Props>,
  ref: ForwardedRef<{
    connect: () => Promise<void>;
    disconnect: () => void;
  }>
) {
  return <Content compRef={ref || createRef()} {...props} />;
}

function Content({
  ProviderUnavailable,
  ChainIdInvalid,
  chain,
  Content: ProvidedContentWrapper,
  compRef,
  children,
}: PropsWithChildren<
  Props & {
    compRef: ForwardedRef<{
      connect: () => Promise<void>;
      disconnect: () => void;
    }>;
  }
>) {
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
    if (autoConnect && !wallet.account) connect();
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
    () => (wallet.isConnected() ? wallet.chainId === chain.id : true),
    [wallet, chain.id]
  );

  async function changeChainId() {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId: `0x${chain.id.toString(16).padStart(2, "0")}`,
          },
        ],
      });
    } catch (e: any) {
      switch (e.code) {
        case 4902:
          window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `0x${chain.id.toString(16).padStart(2, "0")}`,
                chainName: chain.name,
                rpcUrls: [chain.rpcUrl],
                blockExplorerUrls: [chain.explorerUrl],
                nativeCurrency: {
                  symbol: chain.currency,
                  decimals: 18,
                },
              },
            ],
          });
      }
    }
  }
  const ContentWrapper = ProvidedContentWrapper as any;
  return (
    <>
      {ProviderUnavailable && !isProviderAvailable && <ProviderUnavailable />}
      {ChainIdInvalid && !isChainIdValid && (
        <ChainIdInvalid changeChainId={changeChainId} />
      )}
      {
        <ContentWrapper
          {...connectionAsyncWrapper}
          isChainIdValid={isChainIdValid}
          isProviderAvailable={isProviderAvailable}
          isConnectedAndValidChain={isChainIdValid && wallet.isConnected()}
          connect={connect}
          disconnect={disconnect}
          changeChainId={changeChainId}
          chainId={wallet.chainId}
          isConnected={wallet.isConnected()}
          wallet={wallet.account}
        >
          {children}
        </ContentWrapper>
      }
    </>
  );
}

export default forwardRef(WalletConnectionWrapper);
export const BaseWalletConnectionWrapper = forwardRef(
  _BaseWalletConnectionWrapper
);
