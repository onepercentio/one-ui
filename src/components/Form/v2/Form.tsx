import React, { useEffect } from "react";
import { FormMode, FormViewProps } from "./Form.types";
import { useFieldErrors, useForm } from "./Form.hook";
import FormField from "./FormField";

/**
 * Brainstorm:
 * The answers must be externalized in some way because those answers will be manipulated
 * There must be a way to disable non validation related errors
 */

/**
 * A new and improved version of the one-ui design form
 **/
export default function Form({
  questions,
  initialAnswers = {},
  ...props
}: FormViewProps) {
  const { mode = FormMode.WRITE } = props;
  const { showAllErrors = false } = props as FormViewProps & {
    mode: FormMode.WRITE;
  };
  const { answers, onAnswerAction, isQuestionsAnswered, isFilesUploaded } =
    useForm(questions, initialAnswers, mode);
  const errors = useFieldErrors(questions, answers, showAllErrors);

  useEffect(() => {
    if (props.mode !== FormMode.READ_ONLY)
      props.onFormUpdate(answers, isQuestionsAnswered && isFilesUploaded);
  }, [answers, isQuestionsAnswered, isFilesUploaded]);

  return (
    <>
      {questions.map((q) => (
        <FormField
          config={q}
          onAnswer={onAnswerAction}
          value={answers[q.id] as any}
          error={errors[q.id]}
          mode={mode}
        />
      ))}
    </>
  );
}
