import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  FunctionComponent,
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

export type BaseForm = { [k: string]: string | number | any };
export type FormForm = { [k: string]: string | number };

export type FieldTypes = "email" | "text" | "textarea" | "select" | "number";

export type FieldDefinition<
  M extends BaseForm,
  F extends keyof M,
  T extends FieldTypes
> = {
  validator: (v: M[F] | undefined, f: Partial<M>) => string | true;
  placeholder?: string;
} & (T extends "select"
  ? {
      type: "select";
      choices: ComponentProps<typeof import("../Select")["default"]>["items"];
    }
  : T extends "email"
  ? { type: "email"; messages: ComponentProps<typeof EmailInput>["messages"] }
  : T extends "textarea"
  ? {
      type: "textarea";
      lines: number;
    }
  : {
      type: "text" | "number";
      inputProps?: ComponentProps<typeof Input>;
    });

export type ClassName = string;

function AdvancedAction({
  config,
  submited,
  submitting,
  isValid,
  onClick,
  btnProps,
}: Pick<FirebaseFormProps<{}>, "submited" | "submitting"> & {
  config: Exclude<FirebaseFormProps<{}>["submitBtn"], string>;
  isValid: boolean;
  onClick: () => void;
  btnProps: ComponentProps<typeof Button>;
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
      {...btnProps}
    >
      <Element key={key + salt} />
    </AdaptiveButton>
  );
}

export type FormInterface = {
  clear: () => void;
};

export type FirebaseFormProps<M extends FormForm> = {
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
  btnProps?: ComponentProps<typeof Button>;
};
function FirebaseForm<M extends BaseForm>(
  {
    submitting,
    onSubmit,
    submited,
    config,
    submitBtn,
    btnProps = {},
  }: FirebaseFormProps<M>,
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
          case "select":
            return null;
          case "text":
          case "number":
            const isNumber = fieldConfig.type === "number";
            return (
              <Input
                {...fieldConfig.inputProps}
                key={c}
                name={c}
                error={
                  form[c] && invalidMessage !== true
                    ? invalidMessage
                    : undefined
                }
                placeholder={config[c].placeholder}
                value={!isNumber ? form[c] || "" : undefined}
                hideError={"onfocus"}
                onChange={({ target: { value } }: any) => {
                  let _value = isNumber ? Number(value) : value;
                  if (isNumber && Number.isNaN(_value)) {
                    _value = undefined;
                  }
                  setform({
                    ...form,
                    [c]: _value,
                  });
                }}
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
                value={(form[c] as string) || ""}
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
          {...btnProps}
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
          btnProps={btnProps}
        />
      )}
    </>
  );
}
export default forwardRef(FirebaseForm) as typeof FirebaseForm;
