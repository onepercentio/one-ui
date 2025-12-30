import React, {
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import { FormMode, FormViewProps } from "./Form.types";
import { useFieldErrors, useForm } from "./Form.hook";
import FormField from "./FormField";
import { AnswerByField, FormFieldView } from "./FormField/FormField.types";
import { useOneUIConfig } from "../../context/OneUIProvider";

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
  const filterOutInitialAnswers = useMemo(() => {
    const questionIds = questions.map((a) => a.id);
    return Object.fromEntries(
      Object.entries(initialAnswers).filter(([id]) => questionIds.includes(id))
    );
  }, [initialAnswers]);
  const { answers, onAnswerAction, isQuestionsAnswered, isFilesUploaded } =
    useForm(questions, filterOutInitialAnswers, mode);
  const errors = useFieldErrors(questions, answers, showAllErrors);

  useEffect(() => {
    if (props.mode !== FormMode.READ_ONLY) {
      props.onFormUpdate(
        answers as any,
        isQuestionsAnswered && isFilesUploaded
      );
    }
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

  const wrapperClasses = useOneUIConfig("component.form.fieldWrapper", {});

  return (
    <>
      {questions.map((q) => {
        const targetMode = q.readOnly ? FormMode.READ_ONLY : mode;
        const classOrComponentWrapper =
          wrapperClasses[
            `${FormMode[targetMode] as keyof typeof FormMode}-${q.type}`
          ];
        const WrapperComp = useMemo(
          () =>
            typeof classOrComponentWrapper === "function"
              ? classOrComponentWrapper
              : ({ children }: PropsWithChildren) => {
                  return (
                    <div
                      key={q.id}
                      className={`${classOrComponentWrapper || ""}`}
                    >
                      {children}
                    </div>
                  );
                },
          [classOrComponentWrapper]
        );
        return (
          <WrapperComp {...q} value={answers[q.id as keyof typeof answers]}>
            {targetMode === FormMode.WRITE ? (
              <FormField
                config={q}
                onAnswer={onAnswerAction}
                value={answers[q.id as keyof typeof answers]}
                error={(errors as any)[q.id]}
                mode={targetMode}
                data-testid={props["data-testid"]?.(q.id)}
              />
            ) : (
              <FormField
                config={q}
                value={answers[q.id as keyof typeof answers]}
                mode={FormMode.READ_ONLY}
                data-testid={props["data-testid"]?.(q.id)}
              />
            )}
          </WrapperComp>
        );
      })}
    </>
  );
}

/**
 * A new and improved version of the one-ui design form
 *
 * Custom question types can be defined via @type {OnepercentUtility['UIElements']['FormExtension']['fields']}
 **/
export default forwardRef(Form);
