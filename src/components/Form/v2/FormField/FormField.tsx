import React, { useEffect, useState } from "react";
import Styles from "./FormField.module.scss";
import {
  AnswerAction,
  AnswerByField,
  FormFieldProps,
  FormFieldView,
  FormMode,
} from "./FormField.types";
import Select from "../../../Select/Select";
import Input from "../../../Input";
import OneText from "../../../Text";
import Button from "../../../Button";
import Radio from "../../../Radio";
import { AnchoredTooltipAlignment } from "../../../AnchoredTooltip/AnchoredTooltip";
import FileInput from "../../../FileInput/FileInput";
import CheckBox from "../../../CheckBox/CheckBox";
import Spacing from "../../../Spacing";
import { useOneUIConfig } from "../../../../context/OneUIProvider";
import debounce from "lodash/debounce";
// import InputMask from "react-input-mask";

/**
 * The logic for a field of the form
 **/
export default function FormField<Q extends FormFieldView>({
  config: c,
  value,
  ...props
}: FormFieldProps<Q>) {
  const val = <T extends FormFieldView["type"]>() =>
    value as unknown as
      | AnswerByField<{
          type: T;
        }>
      | undefined;
  const ans = <T extends FormFieldView["type"]>(
    answer:
      | AnswerAction<{
          type: T;
        }>
      | undefined
  ) =>
    answer as unknown as AnswerAction<{
      type: T;
    }>;
  const type = c.type;
  const { titleVariant, labelVariant, optionalLabel, extensions } =
    useOneUIConfig("component.form");
  if (props.mode === FormMode.READ_ONLY) {
    switch (type) {
      case "check":
        const checks = val<typeof type>()! || [];
        return (
          <>
            <OneText type={titleVariant}>{c.title}</OneText>
            {checks.includes(true) ? (
              checks.map((checked, i) =>
                checked ? (
                  <OneText type={labelVariant}>{c.options[i].value}</OneText>
                ) : null
              )
            ) : (
              <OneText type={labelVariant}>-</OneText>
            )}
            <Spacing size="small" />
          </>
        );
      case "file":
        const file = val<typeof type>()!;
        return (
          <>
            <FileInput
              states={{
                fileProvided: {
                  title: c.title,
                  description: c.fileUsageDescription,
                },
                waitingFile: {
                  title: c.title,
                  description: c.fileUsageDescription,
                },
              }}
              footer={c.footer}
              onFile={() => {}}
              file={file === true ? ({} as File) : undefined}
              progress={file === true ? 100 : undefined}
              disabled={true}
            />
            <Spacing size="small" />
            {file === true && (
              <Button
                variant="link"
                color="primary"
                onClick={c.openFile!.action}
              >
                {c.openFile!.label}
              </Button>
            )}
            <Spacing size="large" />
          </>
        );
      default:
        const answer = val<typeof type>();
        return (
          <>
            <OneText type={titleVariant}>{c.title}</OneText>
            <OneText type={labelVariant}>{answer || "-"}</OneText>
            <Spacing size="small" />
          </>
        );
    }
  }
  const { onAnswer, error } = props;
  switch (type) {
    case "accept":
      const checks = val<typeof type>() || [];
      return (
        <>
          <div className={Styles.acceptInput}>
            <div>
              <OneText type={titleVariant}>{c.title}</OneText>
              <br />
              <Button
                variant="link"
                color="primary"
                onClick={c.contract.action}
              >
                {c.contract.label}
              </Button>
            </div>
            {error && (
              <div>
                <OneText type="caption" color="error">
                  {error}
                </OneText>
                <br />
              </div>
            )}
            <div>
              {c.accept.map((a, i) => (
                <OneText type={labelVariant}>
                  <CheckBox
                    label={
                      <span>
                        <>
                          {a.label}
                          {a.optional ? (
                            <>
                              <br />
                              <OneText type="caption">{optionalLabel}</OneText>
                            </>
                          ) : (
                            ""
                          )}
                        </>
                      </span>
                    }
                    checked={checks[i]}
                    onToggle={(checked) => {
                      const clone = [...checks];
                      clone[i] = checked;
                      onAnswer(type, c.id, ans<typeof type>(clone));
                    }}
                    groupId={c.id}
                    value={a.label}
                  />
                </OneText>
              ))}
            </div>
          </div>
          <Spacing size="small" />
        </>
      );
    case "file":
      const upload = val<typeof type>();
      const [progress, setProgress] = useState<number | undefined>(() => {
        if (!upload) return undefined;
        if (upload === true) return 100;
        const s = upload.snapshot;
        return (s.bytesTransferred * 100) / s.totalBytes;
      });
      useEffect(() => {
        if (!upload) return setProgress(undefined);
        if (upload === true) {
          setProgress(100);
          return;
        }
        const throttleSetProgress = debounce(setProgress, 250);
        const unsubscribe = upload.on("state_changed", (s) => {
          const progress = (s.bytesTransferred * 100) / s.totalBytes;
          throttleSetProgress(progress);
        });

        return () => {
          unsubscribe();
        };
      }, [upload]);
      return (
        <>
          <FileInput
            states={{
              fileProvided: {
                title: c.title,
                description: c.fileUsageDescription,
              },
              waitingFile: {
                title: c.title,
                description: c.fileUsageDescription,
              },
            }}
            footer={c.footer}
            onFile={(file) => {
              onAnswer(type, c.id, ans<typeof type>(file));
            }}
            file={upload as unknown as File}
            progress={upload ? progress || 0 : undefined}
            accept={c.extensions.map((x) => `.${x}`).join(",")}
          />
          {error ? (
            <OneText type="caption" color="error">
              {error}
            </OneText>
          ) : null}
          <Spacing size="large" />
        </>
      );
    case "radio":
      const selected = val<typeof type>();
      return (
        <>
          <OneText type={titleVariant}>{c.title}</OneText>
          {error && (
            <OneText type="caption" color="error">
              {error}
            </OneText>
          )}
          <br />
          {c.options.map((el) => (
            <>
              <OneText type={labelVariant}>
                <Radio
                  checked={selected === el.value}
                  label={el.label}
                  onToggle={() => onAnswer(type, c.id, el.value)}
                  groupId={c.id}
                  value={el.value}
                />
              </OneText>
              <br />
            </>
          ))}
        </>
      );
    case "check":
      const checkError =
        typeof error === "string" ? c.options.map(() => error) : error;
      const checkmarks = val<typeof type>() || [];
      return (
        <>
          <OneText type={titleVariant}>{c.title}</OneText>
          <br />
          {c.options.map((el, i) => (
            <>
              <OneText type={labelVariant}>
                <CheckBox
                  checked={checkmarks[i]}
                  label={
                    <>
                      {el.label}
                      {checkError?.[i] ? (
                        <OneText type="caption" color="error">
                          {checkError[i]}
                        </OneText>
                      ) : null}
                    </>
                  }
                  onToggle={(checked) => {
                    const clone = [...checkmarks];
                    clone[i] = checked;
                    onAnswer(type, c.id, clone);
                  }}
                  groupId={c.id}
                  value={el.value}
                />
              </OneText>
              <br />
            </>
          ))}
        </>
      );
    case "rawcheck":
      const rawCheckmarks = val<typeof type>() || [];
      return (
        <>
          {error && (
            <>
              <OneText type="caption" color="error">
                {error}
              </OneText>
              <br />
            </>
          )}
          {c.options.map((el, i) => (
            <>
              <OneText type={labelVariant}>
                <CheckBox
                  checked={rawCheckmarks[i]}
                  label={el.label}
                  onToggle={(checked) => {
                    const clone = [...rawCheckmarks];
                    clone[i] = checked;
                    onAnswer(type, c.id, clone);
                  }}
                  groupId={c.id}
                  value={el.value}
                />
              </OneText>
              <br />
            </>
          ))}
        </>
      );
    case "select":
      return (
        <>
          <OneText type={titleVariant}>{c.title}</OneText>
          <Select
            data-testid={`cvm88-${c.id}`}
            alignTo={AnchoredTooltipAlignment.LEFT}
            items={c.options}
            selected={val<typeof type>()!}
            onClick={(i) => {
              onAnswer(type, c.id, i.value);
            }}
            filter={c.filter}
            error={error as string}
          />
        </>
      );
    case "text":
    case "number":
      const filter =
        type === "number"
          ? (val: string) => val.replace(/[^0-9]+/g, "")
          : (val: string) => val;
      return (
        <>
          <OneText type={titleVariant}>{c.title}</OneText>
          <Input
            placeholder={c.title}
            value={val<typeof type>()}
            error={error as string}
            onChange={({ target: { value } }) => {
              onAnswer(type, c.id, filter(value));
            }}
          />
        </>
      );
    default:
      const registeredExtension = extensions?.[type] as any;
      if (registeredExtension) {
        const { Input } = registeredExtension;
        return (
          <Input
            onAnswer={onAnswer}
            question={c as any}
            value={value as any}
            error={error as any}
          />
        );
      }
      throw new Error(
        `The form field "${type}" is not implemented yet. Please provide it using OneUIProvider config options for form extensions`
      );
  }
}
