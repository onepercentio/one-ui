import React, { ComponentProps } from "react";
import Input from "../Input";
import { useCurrencyInput } from "./CurrencyInput.hook";
import { currencyFormatterFactory } from "../../utils/formatters";

export default function CurrencyInput({
  locale,
  value: amount,
  currency,
  onChange,
  placeholder,
  error,
  ...props
}: Omit<ComponentProps<typeof Input>, "onChange"> & {
  currency: string;
  onChange?: (formatted: string) => void;
  locale: string;
}) {
  const { inputRef, moneyFormat, lastPosition } = useCurrencyInput(
    amount,
    locale,
    currency,
    currencyFormatterFactory,
    onChange
  );
  return (
    <>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        value={moneyFormat}
        error={error as string}
        data-testid={props["data-testid"]}
        onChange={({ target: { value, selectionStart = value.length } }) => {
          const diffFromEndToStart = value.length - selectionStart!;
          lastPosition.current = diffFromEndToStart;
          onChange?.(value);
        }}
        disclaimer={props.disclaimer}
        disabled={props.disabled}
      />
    </>
  );
}
