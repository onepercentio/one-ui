import React, { ComponentProps, useMemo, useState } from "react";
import Input from "../Input";
import Button from "../Button";
import Loader from "../Loader";
import EmailInput from "../EmailInput";

type BaseForm = { [k: string]: string };

type FieldTypes = "email" | "text" | "textarea";

type FieldDefinition<
  M extends BaseForm,
  F extends keyof M,
  T extends FieldTypes
> = {
  validator: (v: M[F] | undefined, f: Partial<M>) => string | true;
  placeholder?: string;
} & (T extends "email"
  ? { type: "email"; messages: ComponentProps<typeof EmailInput>["messages"] }
  : T extends "textarea"
  ? {
      type: "textarea";
      lines: number;
    }
  : { type: "text" });

export default function FirebaseForm<M extends BaseForm>({
  submitting,
  onSubmit,
  submited,
  config,
  messages,
}: {
  error: string;
  submitting: boolean;
  submited?: boolean;
  onSubmit: (data: M) => void;
  config: { [k in keyof M]: FieldDefinition<M, k, FieldTypes> };
  messages: {
    submit: string;
  };
}) {
  const [form, setform] = useState<Partial<M>>({});
  const isValid = useMemo(
    () =>
      !Object.keys(config).some(
        (a) => typeof config[a].validator(form[a], form) === "string"
      ),
    [form]
  );

  async function sendContact(_form: typeof form) {
    onSubmit(_form as M);
  }
  return (
    <>
      {Object.keys(config).map((c) => {
        const fieldConfig = config[c];
        const invalidMessage = fieldConfig.validator(form[c], form);
        switch (fieldConfig.type) {
          case "text":
            return (
              <Input
                key={c}
                name={c}
                error={
                  form[c] && invalidMessage !== true
                    ? invalidMessage
                    : undefined
                }
                placeholder={config[c].placeholder}
                value={form[c]}
                hideError={"onfocus"}
                onChange={({ target: { value } }: any) =>
                  setform({
                    ...form,
                    [c]: value,
                  })
                }
              />
            );
          case "email":
            return (
              <EmailInput
                key={c}
                {...fieldConfig}
                name={c}
                hideError={"onfocus"}
                error={
                  form[c] && invalidMessage !== true
                    ? invalidMessage
                    : undefined
                }
                placeholder={config[c].placeholder}
                value={form[c] || ""}
                onChange={(email) =>
                  setform({
                    ...form,
                    [c]: email,
                  })
                }
              />
            );
          case "textarea":
            return <Input
              key={c}
              name={c}
              hideError={"onfocus"}
              error={
                form[c] && invalidMessage !== true ? invalidMessage : undefined
              }
              placeholder={config[c].placeholder}
              value={form[c]}
              onChange={({ target: { value } }: any) =>
                setform({
                  ...form,
                  [c]: value,
                })
              }
              multiline={fieldConfig.lines}
            />;
        }
      })}
      <Button
        variant="filled"
        disabled={submitting || !isValid || submited !== undefined}
        onClick={() => sendContact(form as any)}
      >
        {messages.submit}&nbsp;
        {submitting && <Loader />}
      </Button>
    </>
  );
}
