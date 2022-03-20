import React, { ComponentProps, useRef, useState } from "react";
import WalletConnectionWrapper from "./WalletConnectionWrapper";
import { TransitionAnimationTypes } from "../Transition/Transition";
import StoriesStyles from "./UncontrolledTransition.stories.module.scss";
import AdaptiveDialog from "../AdaptiveDialog";
import Button from "../Button";

export default {
  title: "Wallet Connection Wrapper",
  component: WalletConnectionWrapper,
};

export const BasicUsage = (
  args: ComponentProps<typeof WalletConnectionWrapper>
) => {
  return (
    <WalletConnectionWrapper
      {...args}
      Content={({
        error,
        loading,
        isChainIdValid,
        isProviderAvailable,
        isConnectedAndValidChain,
        connect,
        disconnect,
        changeChainId,
      }) => (
        <>
          <h1>
            The content prop will receive the props of control for handling
            wallet connection
          </h1>
          <h3>You can test this component by using metamask</h3>
          <p>
            <b>Is connected and valid chain: </b>{" "}
            {String(isConnectedAndValidChain)}
          </p>
          <p>Error: {String(error)}</p>
          <p>Loading: {String(loading)}</p>
          <p>
            Valid chain ({args.allowedChainId}): {String(isChainIdValid)}
          </p>
          <p>Provider available ({String(isProviderAvailable)})</p>
          <h2>actions</h2>
          <button onClick={connect}>Connect</button>
          <button onClick={disconnect}>Disconnect</button>
          <button onClick={changeChainId}>
            Change chain id (to the chain id defined on prop)
          </button>
        </>
      )}
    />
  );
};

export const UsageWithActionProps = (
  args: ComponentProps<typeof WalletConnectionWrapper>
) => {
  return (
    <WalletConnectionWrapper
      {...args}
      ProviderUnavailable={() => (
        <AdaptiveDialog open>
          Do something when the provider is not available
        </AdaptiveDialog>
      )}
      ChainIdInvalid={({ changeChainId }) => (
        <AdaptiveDialog open>
          Some action when the chain id is invalid
          <Button variant="filled" onClick={changeChainId}>
            This action come as prop
          </Button>
        </AdaptiveDialog>
      )}
      Content={({ connect }) => (
        <>
          <h1>
            You can also delegate the handling to the props, check the story for
            more details
          </h1>
          <button onClick={connect}>Connect</button>
        </>
      )}
    />
  );
};

BasicUsage.args = {
  allowedChainId: 80001, ///MUMBAI
} as ComponentProps<typeof WalletConnectionWrapper>;

UsageWithActionProps.args = {
  ...BasicUsage.args,
};
