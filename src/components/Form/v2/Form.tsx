import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { BaseQuestion, FormMode, FormViewProps } from "./Form.types";
import { useFieldErrors, useForm } from "./Form.hook";
import FormField from "./FormField";
import { AnswerByField, FormFieldView } from "./FormField/FormField.types";

export type FormRef<Q extends FormFieldView[]> = {
  setAnswer<I extends Q[number]["id"]>(
    questionId: I,
    ans: AnswerByField<Q[number] & { id: I }>
  ): void;
};

function Form<Q extends FormFieldView[]>(
  { questions, initialAnswers = {}, ...props }: FormViewProps<Q>,
  ref: ForwardedRef<FormRef<Q>>
) {
  const { mode = FormMode.WRITE } = props;
  const { showAllErrors = false } = props as FormViewProps<Q> & {
    mode: FormMode.WRITE;
  };
  const { answers, onAnswerAction, isQuestionsAnswered, isFilesUploaded } =
    useForm(questions, initialAnswers, mode);
  const errors = useFieldErrors(questions, answers, showAllErrors);

  useEffect(() => {
    if (props.mode !== FormMode.READ_ONLY)
      props.onFormUpdate(
        answers as any,
        isQuestionsAnswered && isFilesUploaded
      );
  }, [answers, isQuestionsAnswered, isFilesUploaded]);

  useImperativeHandle(
    ref,
    () => ({
      setAnswer(id, val) {
        onAnswerAction(
          questions.find((q) => q.id === id)!.type,
          id,
          val as any
        );
      },
    }),
    []
  );

  return (
    <>
      {questions.map((q) => (
        <FormField
          key={q.id}
          config={q}
          onAnswer={onAnswerAction}
          value={answers[q.id] as any}
          error={(errors as any)[q.id]}
          mode={mode}
        />
      ))}
    </>
  );
}

/**
 * Brainstorm:
 * The answers must be externalized in some way because those answers will be manipulated
 * There must be a way to disable non validation related errors
 */

/**
 * A new and improved version of the one-ui design form
 **/
export default forwardRef(Form);
