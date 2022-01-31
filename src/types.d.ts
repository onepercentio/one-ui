export type CommonErrorCodes = "UNEXPECTED_ERROR";

type Decompose<O extends object> = O

export type BasicContext<T extends object> = {
  set: <P extends keyof T>(p: P, value: T[typeof p]) => void;
} & T;
