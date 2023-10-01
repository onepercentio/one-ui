import React, { useEffect, useMemo } from "react";
import Styles from "./PhoneField.module.scss";
import {
  AnswerByField,
  FormFieldProps,
  FormFieldView,
  GenericFormFieldProps,
} from "../../FormField.types";
import useModule from "../../../../../../hooks/utility/useModule";
import Text from "../../../../../Text";
import Input from "../../../../../Input";
import { useOneUIConfig } from "../../../../../../context/OneUIProvider";

/**
 * An extra form field that enables the user to input a phone number
 **/
export default function phoneFieldFactory(invalidPhoneLabel: string) {
  return function ({
    value,
    question,
    onAnswer,
    error,
  }: GenericFormFieldProps<"phone">) {
    const { country } = question;
    const { titleVariant } = useOneUIConfig("component.form");
    const [phone] = value || ["", false];
    const phoneFormatter = useModule(() =>
      import("google-libphonenumber").then((mod) => {
        return mod.PhoneNumberUtil.getInstance();
      })
    );
    const {
      phoneFormat,
      valid,
      error: phoneError,
    } = useMemo(() => {
      if (!phoneFormatter)
        return {
          phoneFormat: phone,
          valid: false,
          error: "",
        };
      try {
        const phoneInstance = phoneFormatter.parseAndKeepRawInput(
          phone,
          country
        );
        const isPhoneValid = phoneFormatter.isValidNumber(phoneInstance);
        return {
          phoneFormat: phoneFormatter.format(phoneInstance, 2),
          valid: isPhoneValid,
          error: isPhoneValid ? "" : invalidPhoneLabel,
        };
      } catch (e) {
        return {
          phoneFormat: phone,
          valid: false,
          error: invalidPhoneLabel,
        };
      }
    }, [phone, phoneFormatter]);

    useEffect(() => {
      onAnswer("phone", question.id, [phoneFormat, valid, phoneError]);
    }, [phoneFormat, valid]);

    return (
      <>
        <Text type={titleVariant}>{question.title}</Text>
        <Input
          placeholder={question.title}
          value={phoneFormat}
          onChange={({ target: { value } }) => {
            onAnswer("phone", question.id, [value, false, phoneError]);
          }}
          error={error as string}
        />
      </>
    );
  };
}

export const phoneFieldValidator = (
  answer: AnswerByField<{ type: "phone" }>
) => {
  const isValid = !!answer && !!answer[1];
  return {
    isValid,
    error: answer[2],
  };
};
