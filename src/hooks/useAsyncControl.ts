import { useCallback, useState } from "react";
import { CommonErrorCodes } from "../types";

export default function useAsyncControl<E extends CommonErrorCodes, F extends {
  [k: string]: (...args: any[]) => Promise<any>
} | undefined = {}>(functionsToWrap: F) {
  const [error, setError] = useState<E>();
  const [loading, setLoading] = useState<boolean>(false);

  const _process = useCallback(async (asyncFn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(undefined);
      return await asyncFn();
    } catch (e) {
      if (process.env.NODE_ENV === "development") console.error(e);
      setError("UNEXPECTED_ERROR" as E);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    process: _process,
    loading,
    error,
    setError,
    setLoading,
    ...Object.entries(functionsToWrap || {}).reduce((r, [k, func]) => {
      return {
        ...r,
        [k]: (...args) => _process(() => func(...args))
      }
    }, {} as F) as F
  };
}
