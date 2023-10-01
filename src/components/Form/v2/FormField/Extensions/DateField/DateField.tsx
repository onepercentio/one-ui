import React, { ReactNode } from "react";
import Styles from "./DateField.module.scss";
import Text from "../../../../../Text";
import { useOneUIConfig } from "../../../../../../context/OneUIProvider";
import { AnswerByField, GenericFormFieldProps } from "../../FormField.types";
import InputMask from "react-input-mask";
import Input from "../../../../../Input";
import { isValidated } from "../../../Form.hook";

/**
 * Allows inputing a date
 **/
export default function dateFieldFactory(dateFormat: string) {
  return function DateField({
    onAnswer,
    question,
    value,
    error,
  }: GenericFormFieldProps<"date">) {
    const { titleVariant } = useOneUIConfig("component.form");
    return (
      <>
        <Text type={titleVariant}>{question.title}</Text>
        <InputMask
          mask={dateFormat}
          value={value}
          onChange={({ target: { value } }: any) => {
            onAnswer("date", question.id, value as string);
          }}
        >
          {
            ((inputProps: any) => (
              <Input
                {...inputProps}
                placeholder={question.title}
                error={error}
              />
            )) as unknown as ReactNode
          }
        </InputMask>
      </>
    );
  };
}

const parseDate = (formattedDate: string) => {
  const providedDate = formattedDate;
  const dateParts = providedDate.split("/").map(Number);
  if (dateParts.length < 2) return false;
  const [day, month, year] = dateParts;
  const parsedDate = new Date(year, month - 1, day);

  return parsedDate;
};

export const dateFieldValidatorFactory =
  (invalidDateLabel: string, requiredFieldLabel: string) =>
  (answer: AnswerByField<{ type: "date" }>) => {
    const providedDate = answer || "";
    const parsedDate = parseDate(providedDate);
    if (!parsedDate)
      return {
        isValid: false,
        error: invalidDateLabel,
      };
    const dateValidation = isValidated(
      providedDate,
      false,
      undefined,
      requiredFieldLabel
    );
    return dateValidation;
  };
