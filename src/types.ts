type PrependNextNum<A extends Array<unknown>> = A["length"] extends infer T
  ? ((t: T, ...a: A) => void) extends (...x: infer X) => void
    ? X
    : never
  : never;

type EnumerateInternal<A extends Array<unknown>, N extends number> = {
  0: A;
  1: EnumerateInternal<PrependNextNum<A>, N>;
}[N extends A["length"] ? 0 : 1];

export type Enumerate<N extends number> = EnumerateInternal<
  [],
  N
> extends (infer E)[]
  ? E
  : never;

export type Range<FROM extends number, TO extends number> = Exclude<
  Enumerate<TO>,
  Enumerate<FROM>
>;

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
    ethereum: import("@metamask/providers").MetaMaskInpageProvider | undefined;
    PRERENDER: boolean;
    Cypress: any;
  }
}
type NestedValue = unknown;
type FieldValues = unknown;

export declare type Primitive =
  | null
  | undefined
  | string
  | number
  | boolean
  | symbol
  | bigint;
export declare type EmptyObject = {
  [K in string | number]: never;
};
export declare type NonUndefined<T> = T extends undefined ? never : T;
export declare type LiteralUnion<T extends U, U extends Primitive> =
  | T
  | (U & {
      _?: never;
    });
export declare type DeepPartial<T> = T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {
      [key in keyof T]: T[key];
    }
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;
export declare type IsAny<T> = boolean extends (T extends never ? true : false)
  ? true
  : false;
export declare type DeepMap<T, TValue> = {
  [K in keyof T]?: IsAny<T[K]> extends true
    ? any
    : NonNullable<T[K]> extends NestedValue | Date | FileList | File
    ? TValue
    : NonUndefined<T[K]> extends object | null
    ? DeepMap<T[K], TValue>
    : NonUndefined<T[K]> extends Array<infer U>
    ? IsAny<U> extends true
      ? Array<any>
      : U extends NestedValue | Date | FileList
      ? Array<TValue>
      : U extends object
      ? Array<DeepMap<U, TValue>>
      : Array<TValue>
    : TValue;
};
export declare type IsFlatObject<T extends object> = Extract<
  Exclude<T[keyof T], NestedValue | Date | FileList>,
  any[] | object
> extends never
  ? true
  : false;
declare type IsTuple<T extends ReadonlyArray<any>> = number extends T["length"]
  ? false
  : true;
declare type TupleKey<T extends ReadonlyArray<any>> = Exclude<
  keyof T,
  keyof any[]
>;
declare type ArrayKey = number;
declare type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : `${K}.${Path<V>}`;
export declare type Path<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>;
      }[TupleKey<T>]
    : PathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: PathImpl<K & string, T[K]>;
    }[keyof T];
export declare type FieldPath<TFieldValues extends FieldValues> =
  Path<TFieldValues>;
declare type ArrayPathImpl<K extends string | number, V> = V extends Primitive
  ? never
  : V extends ReadonlyArray<infer U>
  ? U extends Primitive
    ? never
    : `${K}` | `${K}.${ArrayPath<V>}`
  : `${K}.${ArrayPath<V>}`;
export declare type ArrayPath<T> = T extends ReadonlyArray<infer V>
  ? IsTuple<T> extends true
    ? {
        [K in TupleKey<T>]-?: ArrayPathImpl<K & string, T[K]>;
      }[TupleKey<T>]
    : ArrayPathImpl<ArrayKey, V>
  : {
      [K in keyof T]-?: ArrayPathImpl<K & string, T[K]>;
    }[keyof T];
export declare type FieldArrayPath<TFieldValues extends FieldValues> =
  ArrayPath<TFieldValues>;
export declare type PathValue<T, P extends Path<T> | ArrayPath<T>> =
  P extends `${infer K}.${infer R}`
    ? K extends keyof T
      ? R extends Path<T[K]>
        ? PathValue<T[K], R>
        : never
      : K extends `${ArrayKey}`
      ? T extends ReadonlyArray<infer V>
        ? PathValue<V, R & Path<V>>
        : never
      : never
    : P extends keyof T
    ? T[P]
    : P extends `${ArrayKey}`
    ? T extends ReadonlyArray<infer V>
      ? V
      : never
    : never;
export declare type FieldPathValue<
  TFieldValues extends FieldValues,
  TFieldPath extends FieldPath<TFieldValues>
> = PathValue<TFieldValues, TFieldPath>;
export declare type FieldArrayPathValue<
  TFieldValues extends FieldValues,
  TFieldArrayPath extends FieldArrayPath<TFieldValues>
> = PathValue<TFieldValues, TFieldArrayPath>;
export declare type FieldPathValues<
  TFieldValues extends FieldValues,
  TPath extends FieldPath<TFieldValues>[] | readonly FieldPath<TFieldValues>[]
> = {} & {
  [K in keyof TPath]: FieldPathValue<
    TFieldValues,
    TPath[K] & FieldPath<TFieldValues>
  >;
};

export type ToFirebaseType<B> = {
  [k in keyof B]: B[k] extends Date
    ? import("firebase/firestore").Timestamp
    : B[k] extends Object
    ? ToFirebaseType<B[k]>
    : B[k];
};

export type FromFirebaseType<B> = {
  [k in keyof B]: B[k] extends import("firebase/firestore").Timestamp
    ? Date
    : B[k] extends Object
    ? FromFirebaseType<B[k]>
    : B[k];
};
