import { IntlFormatters, IntlShape, useIntl } from "react-intl";
import { BigNumber } from "bignumber.js";
import { ReactElement, useEffect, useState } from "react";

export default function useShortIntl(): IntlShape & {
  txt: <R extends ReturnType<IntlFormatters["formatMessage"]> = string>(
    id: OnepercentUtility.IntlIds,
    params?: Record<string, string | ReactElement>
  ) => R;
  formatToDoubleDecimal(
    number: number,
    options?: Parameters<IntlFormatters["formatNumber"]>[1]
  ): string;
  formatBigNumber(
    number: BigNumber,
    options?: Parameters<IntlFormatters["formatNumber"]>[1]
  ): string;
} {
  const intl = useIntl();
  const { formatMessage, formatNumber } = intl;
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const keyDownDetect = (ev: KeyboardEvent) => {
        if (ev.key === "i" && ev.ctrlKey) {
          const keyUpDetect = (ev: KeyboardEvent) => {
            if (ev.key === "i") {
              setDevMode(false);
            }
          };
          setDevMode(true);
          window.addEventListener("keyup", keyUpDetect);
        }
      };
      window.addEventListener("keydown", keyDownDetect);
    }
  });

  return {
    ...intl,
    txt: (id, params) => {
      return devMode ? id : formatMessage({ id }, params) as any;
    },
    formatToDoubleDecimal(val: number, options = {}) {
      return formatNumber(val, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
      });
    },
    formatBigNumber(bigNumber, options) {
      const { decimalSeparator } = intl
        .formatNumberToParts(1000.1)
        .reduce((r, a) => {
          if (a.type === "decimal") return { ...r, decimalSeparator: a.value };
          if (a.type === "group") return { ...r, thousandSeparator: a.value };
          return r;
        }, {} as { decimalSeparator: string; thousandSeparator: string });

      const integerPart = bigNumber.integerValue(1);
      const integer = intl.formatNumber(integerPart.toNumber(), options);
      const decimals = bigNumber
        .minus(integerPart)
        .decimalPlaces(
          options?.maximumFractionDigits || bigNumber.decimalPlaces()!,
          5
        )
        .toString()
        .replace("0.", "");
      return `${integer}${
        decimals !== "0" ? `${decimalSeparator}${decimals}` : ""
      }`;
    },
  };
}

type StrMap = {
  [s: string]: string;
};

type IsolatedMessages<A extends string, M extends StrMap, P extends string> = {
  [s1 in `${P}.${keyof M extends string ? keyof M : ""}`]: M[keyof M];
};

export function isolateMessages<A extends string, M extends StrMap>(
  preffix: A,
  strings: M
) {
  return Object.entries(strings).reduce(
    (r, [k, v]) => ({
      ...r,
      [`${preffix}.${k}`]: v,
    }),
    {} as IsolatedMessages<A, M, typeof preffix>
  );
}
