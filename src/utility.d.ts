/**
 * These are typings made to support separated function and prevent excessive Generics usage accross the application
 * 
 * Redeclare this namespace with the usefull typings for your project and enjoy intelisense :)
 */
namespace OnepercentUtility {
  /** The ids used by the useShortIntl hooks */
  type IntlIds = "generic.id";
  /** A type hint to bind the LinkToId action and the SectionContainer identifier */
  type PageSections = "example-section-1";
  /** A type hint to autocomplete functions related to the AsyncProcessQueue context */
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