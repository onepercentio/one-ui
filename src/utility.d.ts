namespace OnepercentUtility {
  type IntlIds = "generic.id";
  type ApplicationABIs = any[];
  type PageSections = "example-section-1";
}
declare module "use-wallet" {
  import * as UseWallet from "use-wallet";
  export const useWallet: typeof UseWallet['use-wallet'];
  export const UseWalletProvider: typeof UseWallet['UseWalletProvider'];
}