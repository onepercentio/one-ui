import React, { ComponentProps, ReactNode } from "react";
import InputMask from "@mona-health/react-input-mask";
import Text from "../../../../Text";
import { useOneUIConfig } from "../../../../../context/OneUIProvider";
import { AnswerByField, GenericFormFieldProps } from "../../FormField.types";
import Input from "../../../../Input";
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
    ...input
  }: GenericFormFieldProps<"date"> & Pick<ComponentProps<typeof Input>, "data-testid">) {
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
          <Input
            placeholder={question.title}
            error={error}
            data-testid={input["data-testid"]}
          />
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
