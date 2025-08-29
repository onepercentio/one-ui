import { useLayoutEffect, useMemo, useRef } from "react";
import { currencyFormatterFactory } from "../../utils/formatters";

export function useCurrencyInput(
  amount: string | undefined,
  currency: string,
  onChange?: (formattedCurrency: string) => void
) {
  const formatter = useMemo(() => currencyFormatterFactory(currency), []);
  const number = useMemo(
    () => Number(amount?.replace(/[^0-9]/g, "") || 0) / 100,
    [amount]
  );
  const moneyFormat = useMemo(() => {
    return formatter.format(number);
  }, [number, formatter]);

  const lastPosition = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useLayoutEffect(() => {
    const el = inputRef.current!;
    const putCaretOn = el.value.length - lastPosition.current;
    el.setSelectionRange(putCaretOn, putCaretOn);

    onChange?.(moneyFormat);
  }, [moneyFormat]);

  return {
    inputRef,
    moneyFormat,
    lastPosition,
  };
}
