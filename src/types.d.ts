export type CommonErrorCodes = "UNEXPECTED_ERROR";

type Decompose<O extends object> = O;

export type BasicContext<T extends object> = {
  set: <P extends keyof T>(p: P, value: T[typeof p]) => void;
} & T;

/**
 * This is usefull for omitting props from union
 * Check whz contestation model to see an example
 *
 * If different models with different properties use the native Omit<O>
 * Their differences are also omitted generating a single model
 *
 * This typing solves that
 */
export type DistributiveOmit<T, K extends keyof any> = T extends any
  ? Omit<T, K>
  : never;

declare global {
  interface Window {
    ethereum: any;
  }
}
