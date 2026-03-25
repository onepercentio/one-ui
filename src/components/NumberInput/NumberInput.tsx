import { ComponentProps, useEffect, useMemo, useState } from "react";
import Input from "../Input";
import CurrencyInput from "../CurrencyInput";
import bn from "bignumber.js"

const withoutFormat = (strValue: string) =>
    strValue
        .replace(/[^0-9,.]/g, '')
        .replaceAll('.', '')
        .replaceAll(',', '.')

/**
 * A number input component that handles user input and converts it to a numeric value.
 * It provides a user-friendly way to enter numbers while handling formatting automatically.
 */
export default function NumberInput(
    props: Omit<
        ComponentProps<typeof CurrencyInput>,
        'onChange' | 'value' | 'locale' | 'currency'
    > & {
        onChange: (n?: number) => void
        value?: number
        hint?: string
    }
) {
    const [strValue, setStrValue] = useState(() => {
        return withoutFormat(props.value?.toFixed() ?? '')
    })
    const nextValue = useMemo(() => {
        const valueToConvert = withoutFormat(strValue)
        const newValue = Number(valueToConvert)
        return !Number.isNaN(newValue) ? bn(newValue).toNumber() : undefined
    }, [strValue])

    useEffect(() => {
        const t = setTimeout(() => {
            if (nextValue !== props.value)
                setStrValue(withoutFormat(props.value?.toFixed() ?? ''))
        }, 500)
        return () => clearTimeout(t)
    }, [props.value])

    useEffect(() => {
        if (nextValue !== undefined) {
            props.onChange(nextValue)
        } else {
            props.onChange(undefined)
        }
    }, [nextValue])
    return (
        <Input
            {...props}
            value={strValue}
            onChange={(e) => {
                setStrValue(
                    withoutFormat(e.target.value.replace('.', ',')).replace(
                        '.',
                        ','
                    )
                )
            }}
            disclaimer={props.hint}
        />
    )
}