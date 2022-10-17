import { useCallback, useMemo, useState } from "react";
import { Primitive } from "type-fest";

export default function useAsyncControl<
  E = any,
  F extends {
    [f: string]: ((...args: any[]) => Promise<any>) | Object | Primitive;
  } = {}
>(functionsToWrap?: F) {
  const [error, setError] = useState<E | Error>();
  const [loading, setLoading] = useState<boolean>(false);

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
