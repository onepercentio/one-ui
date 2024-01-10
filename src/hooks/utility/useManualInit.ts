import { useCallback, useEffect, useState } from "react";
import useAsyncControl from "../useAsyncControl";

/**
 * Provides a way to manually trigger a function and store it's result on a state
 */
export default function useManualInit<T>(
  funcToMemoize: () => Promise<T>,
  depArr: any[]
): [init: () => Promise<T>, memo: T | undefined | null, error: any] {
  const { process, error } = useAsyncControl();
  const [memo, setMemo] = useState<T | null>();
  const initCb = useCallback(
    () =>
      process(funcToMemoize)
        .then((result) => {
          setMemo(result);
          return result;
        })
        .catch(() => setMemo(null)),
    depArr
  );
  return [initCb, memo, error];
}
