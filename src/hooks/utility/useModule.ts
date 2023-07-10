import { useLayoutEffect, useState } from "react";

/**
 * This provides an interface for async loading of modules
 */
export default function useModule<T>(
  moduleLoadPromiseFactory: () => Promise<T>
): T | undefined {
  const [moduleLoaded, setModuleLoaded] = useState<T>();
  useLayoutEffect(() => {
    moduleLoadPromiseFactory().then(setModuleLoaded);
  }, []);

  return moduleLoaded;
}
