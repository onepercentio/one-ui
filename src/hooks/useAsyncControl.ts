import { SetStateAction, useCallback, useMemo, useState } from "react";
import { Primitive } from "type-fest";

type Arr<X> = [X, React.Dispatch<SetStateAction<X>>];
export type FunctionMap = {
  [f: string]: ((...args: any[]) => Promise<any>) | Object | Primitive;
};
export type Control<E extends any = any> = {
  error?: E;
  loading: boolean;
};
export function useRawAsynControl<E = any, F extends FunctionMap = {}>(
  functionsToWrap: F | undefined,
  [error, setError]: Arr<E | undefined>,
  [loading, setLoading]: Arr<boolean>
) {
  const _process = useCallback(async (asyncFn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(undefined);
      return await asyncFn();
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.error(e);
      setError(e as E);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const { functionsToMemoize, other } = Object.entries(
    functionsToWrap || {}
  ).reduce(
    (r, [k, func]) => {
      return {
        ...r,
        ...(typeof func === "function"
          ? {
              functionsToMemoize: {
                ...r.functionsToMemoize,
                [k]: func,
              },
            }
          : {
              other: {
                ...r.other,
                [k]: func,
              },
            }),
      };
    },
    {
      functionsToMemoize: {},
      other: {},
    } as {
      functionsToMemoize: F;
      other: F;
    }
  );

  return {
    process: _process,
    loading,
    error,
    setError,
    setLoading,
    ...other,
    ...Object.entries(functionsToMemoize).reduce(
      (r, [k, v]) => ({
        ...r,
        [k]: useMemo(
          () =>
            (...args: any[]) =>
              _process(() => (v as any)(...args)),
          [v]
        ),
      }),
      {} as F
    ),
  };
}

/**
 * This hook provides a way to handle async operations storing the loading state, or the error when if fails
 * @param functionsToWrap The functions to wrap in control. The wrapped functions can be called from the returned control object as control.functionName
 * @returns
 */
export default function useAsyncControl<
  E = any,
  F extends {
    [f: string]: ((...args: any[]) => Promise<any>) | Object | Primitive;
  } = {}
>(functionsToWrap?: F) {
  const error = useState<E | Error>();
  const loading = useState<boolean>(false);

  return useRawAsynControl(functionsToWrap, error, loading);
}
