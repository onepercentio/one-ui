import { useState } from "react";
import { CommonErrorCodes } from "../types";

export default function useAsyncControl<E extends CommonErrorCodes>() {
  const [error, setError] = useState<E>();
  const [loading, setLoading] = useState<boolean>(false);

  const process = async (asyncFn: () => Promise<any>) => {
    try {
      setLoading(true);
      setError(undefined);
      await asyncFn();
    } catch (e) {
      setError("UNEXPECTED_ERROR" as E);
    } finally {
      setLoading(false);
    }
  };

  return {
    process,
    loading,
    error,
    setError,
    setLoading,
  };
}
