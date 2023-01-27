// @ts-nocheck
import {
  Contract,
  ContractOptions,
  EventData,
  PastEventOptions,
} from "web3-eth-contract";
import { AbiItem } from "web3-utils";

export type AllABIs = readonly any[];

type ExtractMethods<A extends AllABIs[number]> = A extends {
  type: "function";
}
  ? A["name"]
  : never;

type ExtractEvents<A extends AllABIs[number]> = A extends {
  type: "event";
}
  ? A["name"]
  : never;

type TypeOrInternalType<T> = T['internalType'] extends unknown ? T['type'] : T['internalType']

type MapTypeToJS<L, C> =
  L extends "tuple[]" ? TuplifyUnion<C[number], C[number]['name']>[] :
  L extends "address" | "uint256" | "uint128" | "uint8" | "string" | "bytes32"
  ? string
  : L extends "uint256[]" | "string[]"
  ? string[]
  : L extends "bool"
  ? boolean
  : L extends 'tuple'
  ? TuplifyUnion<C[number], C[number]['name']>
  : unknown;

type ExtractFromObj<R extends (AllABIs[number] & { type: "function" })> = {
  [K in R["outputs"][number]["name"]]: MapTypeToJS<
    TypeOrInternalType<(R["outputs"][number] & {
      name: K;
    })>,
    (R["outputs"][number] & {
      name: K;
    })["components"]
  >;
}

export type ExtractMethodDefinition<
  A extends AllABIs,
  N extends (AllABIs[number] & { type: "function" })["name"],
  R = A[number] & {
    type: "function";
    name: N;
  }
  > = (
    ...args: TuplifyUnion<
      (A[number] & {
        type: "function";
        name: N;
      })["inputs"][number],
      (A[number] & {
        type: "function";
        name: N;
      })["inputs"][number]["name"]
    >
  ) => {
    call: () => Promise<
      R extends { outputs: { length: 1 } }
      ? MapTypeToJS<
        TypeOrInternalType<R["outputs"][0]>,
        R["outputs"][0]['components']
      >
      : R extends { outputs: any }
      ? ExtractFromObj<R>
      : void
    >;
    send: (prop: { from: string, maxPriorityFeePerGas?: number, gas?: number, gasPrice?: string }) => Promise<void>;
  };

// oh boy don't do this
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never;

// TS4.0+
type Push<T extends any[], V> = [...T, V];

// TS4.1+
export type TuplifyUnion<
  FUNCS,
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
  > = true extends N
  ? []
  : Push<
    TuplifyUnion<FUNCS, Exclude<T, L>>,
    MapTypeToJS<
      TypeOrInternalType<(FUNCS & { name: L })>,
      (FUNCS & { name: L })['components']
    >
  >;

export default class GenericContract<
  A extends AllABIs = AllABIs,
  E extends string = ExtractEvents<A[number]> | "allEvents"
  > extends Contract {
  events!: Exclude<E, "allEvents">;
  constructor(jsonInterface: A, address?: string, options?: ContractOptions) {
    super(jsonInterface as unknown as AbiItem[], address, options);
  }
  override methods!: {
    [k in ExtractMethods<A[number]>]: ExtractMethodDefinition<A, k>;
  };
  override getPastEvents(event: E): Promise<GenericEventData<A>[]>;
  override getPastEvents(
    event: E,
    options: PastEventOptions,
    callback: (error: Error, event: EventData) => void
  ): Promise<GenericEventData<A>[]>;
  override getPastEvents(
    event: E,
    options: PastEventOptions
  ): Promise<GenericEventData<A>[]>;
  override getPastEvents(
    event: E,
    callback: (error: Error, event: EventData) => void
  ): Promise<GenericEventData<A>[]>;
  override getPastEvents(
    event: any,
    options?: any,
    callback?: any
  ): Promise<GenericEventData<A>[]> {
    return super.getPastEvents(event, options, callback) as any;
  }
}

export type GenericEventData<E extends AllABIs> = EventData & GenericEvent<E>;

type ABIEvent = AllABIs[number] & { type: "event" };

type GenericEvent<
  ABI extends AllABIs,
  E extends string = ExtractEvents<ABI[number]>
  > = {
    event: E;
    returnValues: ExtractReturnValues<ABIEvent & { name: E }>;
  };

type ExtractReturnValues<E extends ABIEvent> = ExtractInputType<
  E["inputs"][number]
>;

type ExtractInputType<I extends ABIEvent["inputs"][number]> = {
  [k in I["name"]]: MapTypeToJS<
    TypeOrInternalType<I>,
    I['components']
  >;
};
