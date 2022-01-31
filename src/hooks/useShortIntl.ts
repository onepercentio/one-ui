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
