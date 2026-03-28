import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  PropsWithChildren,
  useEffect,
  useImperativeHandle,
  useMemo,
} from "react";
import {
  AnswersMap,
  BaseQuestion,
  FormMode,
  FormViewProps,
} from "./Form.types";
import {
  useFieldErrors,
  useForm,
  useFormAnswers,
  useFormState,
} from "./Form.hook";
import FormField from "./FormField";
import { AnswerByField, FormFieldView } from "./FormField/FormField.types";
import { useOneUIConfig } from "../../context/OneUIProvider";

export type FormRef<Q extends FormFieldView[]> = {
  setAnswer<I extends Q[number]["id"]>(
    questionId: I,
    ans: AnswerByField<Q[number] & { id: I }>,
  ): void;
};

function Form<Q extends FormFieldView[]>(
  { questions, initialAnswers = {}, ...props }: FormViewProps<Q>,
  ref: ForwardedRef<FormRef<Q>>,
) {
  const filterOutInitialAnswers = useMemo(() => {
    const questionIds = questions.map((a) => a.id);
    return Object.fromEntries(
      Object.entries(initialAnswers).filter(([id]) => questionIds.includes(id)),
    );
  }, [initialAnswers]);
  const answers = useFormAnswers(filterOutInitialAnswers, props.mode!);

  return (
    <ControlledForm
      ref={ref}
      questions={questions}
      initialAnswers={initialAnswers}
      answers={answers}
      {...props}
    />
  );
}

const forwardedRef = forwardRef(Form);

/**
 * A new and improved version of the one-ui design form
 *
 * Custom question types can be defined via @type {OnepercentUtility['UIElements']['FormExtension']['fields']}
 *
 * This component displays a form with multiple questions and allows users
 * to enter answers to those questions. It handles validation, different
 * display modes, and manages the form's state.
 **/
export default forwardedRef as unknown as <Q extends BaseQuestion[]>(
  p: FormViewProps<Q> & Pick<ComponentProps<typeof forwardedRef>, "ref">,
) => React.ReactElement;

function ControlledFormComp<Q extends FormFieldView[]>(
  {
    questions,
    initialAnswers = {},
    answers: answersControl,
    ...props
  }: FormViewProps<Q> & {
    answers: ReturnType<typeof useFormAnswers<AnswersMap<Q>>>;
  },
  ref: ForwardedRef<FormRef<Q>>,
) {
  const { mode = FormMode.WRITE } = props;
  const { showAllErrors = false } = props as unknown as FormViewProps<Q> & {
    mode: FormMode.WRITE;
  };
  const { answers, onAnswerAction, isQuestionsAnswered, isFilesUploaded } =
    useFormState(questions, answersControl as any);
  const errors = useFieldErrors(
    questions,
    answersControl.answers,
    showAllErrors,
  );

  const answersArray = useMemo(() => {
    return questions.map(
      (q) =>
        answersControl.answers[q.id as keyof typeof answersControl.answers],
    );
  }, [questions.map((a) => a.id), answersControl.answers]);

  useEffect(() => {
    if (props.mode !== FormMode.READ_ONLY) {
      props.onFormUpdate(
        answers as any,
        isQuestionsAnswered && isFilesUploaded,
      );
    }
  }, [...answersArray, isQuestionsAnswered, isFilesUploaded]);

  useImperativeHandle(
    ref,
    () => ({
      setAnswer(id, val) {
        onAnswerAction(
          questions.find((q) => q.id === id)!.type,
          id,
          val as any,
        );
      },
    }),
    [],
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
          [classOrComponentWrapper],
        );
        return (
          <WrapperComp
            {...q}
            value={
              answersControl.answers[
                q.id as keyof typeof answersControl.answers
              ]
            }
          >
            {targetMode === FormMode.WRITE ? (
              <FormField
                config={q}
                onAnswer={onAnswerAction}
                value={
                  answersControl.answers[
                    q.id as keyof typeof answersControl.answers
                  ]
                }
                error={(errors as any)[q.id]}
                mode={targetMode}
                data-testid={props["data-testid"]?.(q.id)}
              />
            ) : (
              <FormField
                config={q}
                value={
                  answersControl.answers[
                    q.id as keyof typeof answersControl.answers
                  ]
                }
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

export const ControlledForm = forwardRef(ControlledFormComp);
