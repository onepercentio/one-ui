import { createRef, useRef } from "react";
import useAsyncControl from "./useAsyncControl";
import usePooling from "./usePooling";

/**
 * A toolkit hook to trigger an request to start a process and execute a pooling operation to validate when the operation is finished
 */
export default function usePooledOperation() {
  const requestOperation = useRef<() => Promise<void>>();
  const poolingOperation = useRef<() => Promise<boolean>>();
  const requestControl = useAsyncControl();
  const pollingControl = usePooling();

  function triggerRequest() {
    requestControl.process(async () => {
      await requestOperation.current!();
      triggerPooling();
    });
  }

  function triggerPooling() {
    pollingControl.startPolling(poolingOperation.current!);
  }

  return {
    /** Indicates when it's loading */
    loading: requestControl.loading || pollingControl.isPooling,
    /** Indicates error of pooling or request */
    error: !!requestControl.error || !!pollingControl.failed,
    /** Retries the operation based on the current failed step */
    retry: requestControl.error
      ? triggerRequest
      : pollingControl.failed
      ? triggerPooling
      : undefined,
    /** Initiates the request followed by the pooling operation */
    start: (
      /** An arbitrary request */
      _requestOperation: () => Promise<void>,
      /** Resolves to a boolean that indicated if is finished (true) or not (false) */
      _poolingOperation: () => Promise<boolean>
    ) => {
      requestOperation.current = _requestOperation;
      poolingOperation.current = _poolingOperation;

      triggerRequest();
    },
    /** Clear any error that is registered */
    clearError: () => {
      requestControl.setError(undefined);
      pollingControl.setFailed(false);
    },
  };
}
