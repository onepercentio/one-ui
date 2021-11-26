import { debounce } from "lodash";
import React from "react";
import { createContext, PropsWithChildren, useContext } from "react";

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

type DeepRequired<T> = {
  [P in keyof T]: DeepRequired<T[P]>;
};

type ContextSpecs = {
  component: {
    passwordInput: {
      iconSrc: {
        passwordHidden: string;
        passwordVisible: string;
      };
    };
  };
};
type ContextConfigSpecs = DeepPartial<ContextSpecs>;

const Context = createContext<ContextConfigSpecs>(null as any);

export default function OneUIProvider({
  children,
  config,
}: PropsWithChildren<{ config: ContextConfigSpecs }>) {
  return <Context.Provider value={config}>{children}</Context.Provider>;
}

const debouncedError = debounce((message: string) => {
  const event = new Event("error");
  (event as any).error = new Error(message);
  window.dispatchEvent(event);
}, 100);
export function ProtectVariableAccess(obj?: any, basePath: string[] = []): any {
  const proxyInstance = new Proxy(() => obj || {}, {
    apply: (target) => {
      return String(target());
    },
    get: (ctx, variable) => {
      const value = ctx()[variable as keyof ReturnType<typeof ctx>];
      if (variable === Symbol.toPrimitive) return ctx;
      if (value === undefined) {
        const path = [...basePath, variable.toString()];
        debouncedError(
          `A component is using the UI config ${path.join(".")}.
          
Please define it using:
import OneUIProvider from "@onepercent/one-ui/dist/context/OneUIProvider";
...
  <OneUIProvider config={THE_MISSING_CONFIG}>
    ...
  </OneUIProvider>`
        );
      }
      if (
        (typeof value === "object" && !Array.isArray(value)) ||
        value === undefined
      )
        return ProtectVariableAccess(value, [...basePath, variable.toString()]);
      return value;
    },
  });
  return proxyInstance;
}

export function useOneUIProvider() {
  const context = useContext(Context);

  if (process.env.NODE_ENV === "development") {
    return ProtectVariableAccess(context) as DeepRequired<ContextSpecs>;
  }

  return context as DeepRequired<ContextSpecs>;
}
