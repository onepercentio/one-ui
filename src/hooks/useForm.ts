import { Context, useMemo, useState } from "react"
import { BaseForm, FieldDefinition, FieldTypes } from "../components/Form/Form";

type Intermediary<F extends BaseForm> = {
    form: F,
    formValidation: {
        [k in keyof F]: string
    } & { isValid: string | true },
    set: <K extends keyof F>(k: K, value: F[K]) => void
}
export type FormControls<C extends FormConfig<any>> = Intermediary<C extends FormConfig<infer F> ? F : never>
export type FormConfig<T extends BaseForm> = { [k in keyof T]: FieldDefinition<T, k, FieldTypes> };
export default function useContextForm<T extends BaseForm>(
    config: FormConfig<T>,
    initialState: T
): FormControls<FormConfig<T>> {
    const [form, setForm] = useState<Partial<T>>(initialState);
    const isValid = useMemo(
        () =>
            !Object.keys(config).some(
                (a) => typeof config[a].validator(form[a], form) === "string"
            ),
        [form]
    );

    const _setFormField: <K extends keyof T>(k: K, value: T[K]) => void = (key, value) => {
        setForm(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const validFormFields = useMemo(() => {
        return Object.keys(config).reduce((result, field: keyof T) => {
            const fieldConfig = config[field];
            const invalidMessage = fieldConfig.validator(form[field], form);
            return {
                ...result,
                [field]: invalidMessage
            }
        }, { isValid } as { [k in keyof T]: string | true } & { isValid: boolean })
    }, [form, isValid]);

    return {
        form: form,
        formValidation: validFormFields,
        set: _setFormField
    } as any
}