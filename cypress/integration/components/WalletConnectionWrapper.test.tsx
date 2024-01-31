import WalletConnectionWrapper from "components/WalletConnectionWrapper";
import useAsyncControl from "hooks/useAsyncControl";

it("Should be able to handle invalid chain configuration", () => {
  cy.needsMetamask();
  cy.mount(
    <WalletConnectionWrapper
      Content={({ changeChainId, isChainIdValid, chainId }) => {
        const { changeChainId: changeChain, ...control } = useAsyncControl({
          changeChainId,
        });
        return (
          <>
            <h1>Wallet connection content</h1>
            <p>
              Is on valid chain {String(isChainIdValid)} {chainId}
            </p>
            <button onClick={changeChain}>Change chain id</button>
            <h1>Loading {String(control.loading)}</h1>
            <h1>Error {String(control.error)}</h1>
          </>
        );
      }}
      chain={{
        id: 67000,
        currency: "xpto",
        explorerUrl: "http://localhost:19000",
        name: "False network",
        rpcUrl: "http://localhost:19001",
      }}
    />
  );
});
