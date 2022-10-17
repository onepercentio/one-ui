import { Router, useHistory } from "react-router-dom";
import { createBrowserHistory } from "history";
import React, {
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

export type CustomState = {
  internalNavigation?: boolean;
};

export default function CustomBrowserRouter({
  children,
  beforeRouteChange = (s) => s,
}: PropsWithChildren<{
  /**
   * Allows the dev to modify the route before commiting the route change
   *
   * @returns The new route
   */
  beforeRouteChange?: (
    newRoute: string,
    history: ReturnType<typeof createBrowserHistory>
  ) => string;
}>) {
  const { current: historyCustom } = useRef(createBrowserHistory<any>());
  useLayoutEffect(() => {
    function overrideFunction(name: keyof typeof historyCustom) {
      const orig = historyCustom[name] as any;
      (historyCustom as any)[name] = (
        route: string,
        state: CustomState | null,
        ...args: any[]
      ) => {
        const isReplacingAnInternalNavigation =
          name === "replace" && history.state?.state?.internalNavigation;
        const isARouteChange = name !== "replace";
        if ((isARouteChange || isReplacingAnInternalNavigation) && !state)
          state = {};
        if (state)
          state.internalNavigation =
            name === "replace"
              ? history.state?.state?.internalNavigation
              : true;
        const modifiedRoute = beforeRouteChange(route, historyCustom);
        return orig(modifiedRoute, state, ...args);
      };
    }
    overrideFunction("push");
    overrideFunction("replace");
  }, [historyCustom]);
  return <Router history={historyCustom}>{children}</Router>;
}
