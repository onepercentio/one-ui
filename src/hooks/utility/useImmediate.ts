import { useMemo } from "react";

/**
 * Runs this function as soon as the hook is invoked
 */
export default function useImmediate(execute: () => void, deps?: any[]) {
  useMemo(execute, deps ?? []);
}
