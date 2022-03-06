import { IntlFormatters, IntlShape, useIntl } from "react-intl";

export default function useShortIntl(): IntlShape & {
  txt: (
    id: OnepercentUtility.IntlIds,
    params?: Parameters<IntlFormatters["formatMessage"]>[1]
  ) => ReturnType<IntlFormatters["formatMessage"]>;
} {
  const intl = useIntl();
  const { formatMessage } = intl;
  return {
    ...intl,
    txt: (
      id: OnepercentUtility.IntlIds,
      params?: Parameters<IntlFormatters["formatMessage"]>[1]
    ) => {
      return formatMessage({ id }, params);
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
