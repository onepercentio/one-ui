import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  FunctionComponent,
  MutableRefObject,
  ReactElement,
  RefObject,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import Input from "../Input";
import Button from "../Button";
import Loader from "../Loader";
import EmailInput from "../EmailInput";
import AdaptiveButton from "../AdaptiveButton";

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

type ClassName = string;

function AdvancedAction({
  config,
  submited,
  submitting,
  isValid,
  onClick,
}: Pick<ComponentProps<typeof FirebaseForm>, "submited" | "submitting"> & {
  config: Exclude<ComponentProps<typeof FirebaseForm>["submitBtn"], string>;
  isValid: boolean;
  onClick: () => void;
}) {
  const [key, Element, className] =
    submited === false
      ? ["error", ...config.error]
      : submited === true
      ? ["success", ...config.success]
      : submitting
      ? ["loading", ...config.loading]
      : ["default", ...config.label];

  const salt = useMemo(() => Date.now(), [key]);

  return (
    <AdaptiveButton
      variant="filled"
      className={className}
      disabled={!isValid}
      onClick={onClick}
    >
      <Element key={key + salt} />
    </AdaptiveButton>
  );
}

export type FormInterface = {
  clear: () => void;
};

function FirebaseForm<M extends BaseForm>(
  {
    submitting,
    onSubmit,
    submited,
    config,
    submitBtn,
  }: {
    ref?: RefObject<FormInterface>;
    submitting: boolean;
    onSubmit: (data: M) => void;
    submited?: boolean;
    config: { [k in keyof M]: FieldDefinition<M, k, FieldTypes> };
    submitBtn:
      | string
      | {
          label: [FunctionComponent] | [FunctionComponent, ClassName];
          loading: [FunctionComponent] | [FunctionComponent, ClassName];
          error: [FunctionComponent] | [FunctionComponent, ClassName];
          success: [FunctionComponent] | [FunctionComponent, ClassName];
        };
  },
  ref: ForwardedRef<FormInterface>
) {
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

  useImperativeHandle(
    ref,
    () => ({
      clear: () => setform({}),
    }),
    [ref]
  );

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
                value={form[c] || ""}
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
            return (
              <Input
                key={c}
                name={c}
                hideError={"onfocus"}
                error={
                  form[c] && invalidMessage !== true
                    ? invalidMessage
                    : undefined
                }
                placeholder={config[c].placeholder}
                value={form[c] || ""}
                onChange={({ target: { value } }: any) =>
                  setform({
                    ...form,
                    [c]: value,
                  })
                }
                multiline={fieldConfig.lines}
              />
            );
        }
      })}
      {typeof submitBtn === "string" ? (
        <Button
          variant="filled"
          disabled={submitting || !isValid || submited !== undefined}
          onClick={() => sendContact(form as any)}
        >
          {submitBtn}&nbsp;
          {submitting && <Loader />}
        </Button>
      ) : (
        <AdvancedAction
          config={submitBtn}
          isValid={isValid}
          onClick={() => sendContact(form as any)}
          submitting={submitting}
          submited={submited}
        />
      )}
    </>
  );
}
export default forwardRef(FirebaseForm) as typeof FirebaseForm;
