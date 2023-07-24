import get from "lodash/get";
import merge from "lodash/merge";
import clone from "lodash/cloneDeep";
import { Get } from "type-fest";
import React, { ComponentProps, ReactElement, useMemo } from "react";
import { createContext, PropsWithChildren, useContext } from "react";
import { FieldPath } from "../type-utils";
import useAdaptiveImage from "../hooks/ui/useAdaptiveImage";
import { ImageScales } from "@muritavo/webpack-microfrontend-scripts/bin/types/ImageScales";
import Button from "../components/Button";
import CheckBox from "../components/CheckBox";
import Radio from "../components/Radio/Radio";
import { FileInputProps } from "../components/FileInput/FileInput";
import { FileInputViewProps } from "../components/FileInput/View/View.types";

type DeepPartial<T> = {
  [P in keyof T]?: NonNullable<T[P]> extends Function
    ? T[P]
    : DeepPartial<T[P]>;
};

export type OneUIContextSpecs = {
  component: {
    text?: {
      className?: {
        [k in React.ComponentProps<
          typeof import("../components/Text")["default"]
        >["type"]]?: string;
      };
      htmlTag?: {
        [k in React.ComponentProps<
          typeof import("../components/Text")["default"]
        >["type"]]?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      };
    };
    button?: {
      className?: {
        [k in NonNullable<
          React.ComponentProps<
            typeof import("../components/Button")["default"]
          >["variant"]
        >]?: string;
      };
      Component?: (props: ComponentProps<typeof Button>) => ReactElement;
    };
    input: {
      className: string;
      border: boolean;
    };
    fileInput: {
      View: (props: FileInputViewProps) => ReactElement;
    };
    passwordInput: {
      iconSrc: {
        passwordHidden: string;
        passwordVisible: string;
      };
    };
    asyncWrapper: {
      LoadingComponent?: () => JSX.Element;
      messages: {
        error: {
          title: string;
          retryBtn: string;
        };
      };
    };
    select: {
      StateIndicator: (props: { open: boolean }) => JSX.Element;
      className?: {
        dropdown?: string;
        item?: string;
        selectedItem?: string;
      };
    };
    header: {
      LogoImage: () => JSX.Element;
      MoreOptions: ({ open }: { open: boolean }) => JSX.Element;
    };
    table: {
      controls: {
        PrevPage: ({ disabled }: { disabled: boolean }) => JSX.Element;
        NextPage: ({ disabled }: { disabled: boolean }) => JSX.Element;
      };
    };
    tooltip: {
      className?: string;
    };
    adaptiveDialog: {
      dialogClassName: string;
      backdropClassName: string;
    };
    adaptiveSidebar: {
      className: string;
      controlClassName: string;
    };
    checkbox: {
      Component?: (props: ComponentProps<typeof CheckBox>) => ReactElement;
    };
    radio: {
      Component?: (props: ComponentProps<typeof Radio>) => ReactElement;
    };
  };
  hook: {
    ui: {
      usePaginationControls: {
        LeftControl: () => ReactElement;
        RightControl: () => ReactElement;
        className?: string;
      };
    };
  };
  state: {
    imageScale: ImageScales;
  };
};

type ContextConfigSpecs = DeepPartial<OneUIContextSpecs>;

const Context = createContext<ContextConfigSpecs>(null as any);

export default function OneUIProvider({
  children,
  config,
}: PropsWithChildren<{ config: ContextConfigSpecs }>) {
  const prevCtx = useContext(Context);
  const scale = useAdaptiveImage();
  const mergedConfig = useMemo(() => {
    return merge(clone(prevCtx), config, {
      state: {
        imageScale: scale,
      },
    });
  }, [prevCtx, config, scale]);

  return <Context.Provider value={mergedConfig}>{children}</Context.Provider>;
}

function pathToJson(
  path: string,
  key?: string | Symbol,
  exampleConfig = "THE_MISSING_CONFIG"
) {
  if (!key) {
    key = path.split(".").slice(-1)[0];
    path = path.replace(`.${key}`, "");
  }

  return path
    .split(".")
    .concat(key as string)
    .reduce((result, key, idx, arr) => {
      (arr.slice(0, idx).reduce((r, k) => (r as any)[k], result) as any)[key] =
        idx === arr.length - 1 ? exampleConfig : {};
      return result;
    }, {});
}

function ErrorWrapper(
  originalObject: any,
  path: string = "config"
): typeof Proxy {
  return new Proxy(
    typeof originalObject !== "object" ? {} : originalObject || {},
    {
      get(_target, key) {
        if (key === Symbol.toPrimitive) {
          return () => _target[key];
        }
        try {
          const value = originalObject[key];
          if (typeof value === "undefined") return undefined;
          if (typeof value === "object")
            return ErrorWrapper(value, [path, key].filter(Boolean).join("."));
          return value;
        } catch (e) {
          const pathJson = pathToJson(path, key);
          throw new Error(
            `A component is using the UI config ${[path, key].join(".")}.

Please define it using:
import OneUIProvider from "@onepercent/one-ui/dist/context/OneUIProvider";

  ...
${`<OneUIProvider config={${JSON.stringify(pathJson, null, 4)}}>
...
</OneUIProvider>`.replace(/[ ]/g, "-")}`
          );
        }
      },
    }
  );
}

export function useOneUIContext() {
  const context = useContext(Context);

  if (process.env.NODE_ENV === "development")
    return ErrorWrapper(context) as unknown as OneUIContextSpecs;

  return context as OneUIContextSpecs;
}

export function useOneUIView<P extends FieldPath<OneUIContextSpecs>>(
  oneuiConfigPath: P,
  componentName: string
) {
  const providedValue = useOneUIConfig(oneuiConfigPath);
  if (!providedValue) {
    throw new Error(`The component ${componentName} requires a view to be set on OneUI initialization

Views ready for use with this component shall be available at:
import SomeView from "@onepercentio/one-ui/dist/components/${componentName}/View/SomeView";
    
Please define it using:
import OneUIProvider from "@onepercentio/one-ui/dist/context/OneUIProvider";

  ...
${`<OneUIProvider config={${JSON.stringify(
  pathToJson(oneuiConfigPath, undefined, "SomeView"),
  null,
  4
)}}>
...
</OneUIProvider>`.replace(/[ ]/g, "-")}`);
  }

  return providedValue;
}

export function useOneUIConfig<
  P extends FieldPath<OneUIContextSpecs>,
  T extends Get<OneUIContextSpecs, P>
>(prop: P, defaultValue?: T): NonNullable<Get<OneUIContextSpecs, P>> {
  const context = useContext(Context);
  if (process.env.NODE_ENV === "development") {
    const val = useMemo(() => {
      return get(context, prop);
    }, [context, prop]);
    if (
      typeof val === "string" ||
      typeof val === "function" ||
      prop.endsWith(".Component") ||
      prop.endsWith(".View")
    )
      return (val as any) || defaultValue;

    if (typeof val === "boolean") return val as any;
    return ErrorWrapper(val || defaultValue) as unknown as NonNullable<T>;
  }
  const value = useMemo(() => {
    return get(context, prop);
  }, [context, prop]);
  return value || defaultValue;
}

export function useCurrentImageScale() {
  const context = useContext(Context);

  return context.state!.imageScale!;
}
