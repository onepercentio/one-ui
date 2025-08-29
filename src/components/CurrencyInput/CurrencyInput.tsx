import { ComponentProps } from "react"
import Input from "../Input"
import { useCurrencyInput } from "./CurrencyInput.hook"

export default function CurrencyInput({ value: amount, currency, onChange, placeholder, error, ...props }: Omit<ComponentProps<typeof Input>, 'onChange'> & { currency: string, onChange?: (formatted: string) => void }) {
    const { inputRef, moneyFormat, lastPosition } = useCurrencyInput(amount, currency, onChange)
    return (
        <>
            <Input
                ref={inputRef}
                placeholder={placeholder}
                value={moneyFormat}
                error={error as string}
                data-testid={props['data-testid']}
                onChange={({
                    target: { value, selectionStart = value.length },
                }) => {
                    const diffFromEndToStart = value.length - selectionStart!
                    lastPosition.current = diffFromEndToStart
                    onChange?.(value)
                }}
            />
        </>
    )
}