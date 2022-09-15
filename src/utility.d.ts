namespace OnepercentUtility {
  type IntlIds = "generic.id";
  type ApplicationABIs = any[];
  type PageSections = "example-section-1";
  namespace AsyncQueue {
    /** These are the recovery types available */
    type RecoveryTypes = {
      [R: string]: any[]
    }

    /** These are the available UI models */
    type UIModels = {
      [k: string]: any[]
    }
  }
}
declare module "use-wallet" {
  import * as UseWallet from "use-wallet";
  export const useWallet: typeof UseWallet['use-wallet'];
  export const UseWalletProvider: typeof UseWallet['UseWalletProvider'];
}