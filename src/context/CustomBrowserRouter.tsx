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
}: PropsWithChildren<{}>) {
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
        return orig(route, state, ...args);
      };
    }
    overrideFunction("push");
    overrideFunction("replace");
  }, [historyCustom]);
  return <Router history={historyCustom}>{children}</Router>;
}
