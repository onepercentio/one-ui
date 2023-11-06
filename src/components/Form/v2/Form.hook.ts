import { useLayoutEffect, useMemo, useState } from "react";
import { useOneUIConfig } from "../../../context/OneUIProvider";
import {
  AnswerAction,
  AnswerByField,
  FormField,
  FormFieldView,
  FormMode,
} from "./FormField/FormField.types";
import { AnswersMap } from "./Form.types";
import { UploadTask, UploadTaskSnapshot } from "firebase/storage";

export function useForm(
  currentQuestions: FormFieldView[],
  defaultAnswers: AnswersMap,
  mode: FormMode
) {
  const formConfig = useOneUIConfig("component.form");
  const [answers, setAnswers] = useState<AnswersMap>(() => {
    const clone = {
      ...defaultAnswers,
    };
    if (mode === FormMode.READ_ONLY) return clone;
    return clone;
  });

  const { isValid: isQuestionsAnswered } = useMemo(() => {
    return areAllQuestionsAnswered(
      currentQuestions,
      answers,
      formConfig.requiredLabel
    );
  }, [answers, currentQuestions]);

  const onAnswerAction = <T extends FormField["type"]>(
    questionType: T,
    id: string,
    answer:
      | AnswerAction<{
          type: T;
        }>
      | undefined
  ) => {
    switch (questionType) {
      case "file":
        const { onFileUpload } = formConfig;
        setAnswers((prev: any) => {
          const file = answer as File | undefined;
          if (file)
            return {
              ...prev,
              [id]: onFileUpload(id, file),
            };
          delete prev[id];
          return { ...prev };
        });
        break;
      default:
        setAnswers((prev) => ({
          ...prev,
          [id]: answer as string,
        }));
    }
  };

  const isFilesUploaded = useFileUploads(currentQuestions, answers);

  return {
    answers,
    isQuestionsAnswered,
    isFilesUploaded,
    onAnswerAction,
    questions: currentQuestions,
  };
}

function useFileUploads(questions: FormField[], answers: AnswersMap) {
  const fileUploadQuestions = useMemo(
    () => questions.filter((a) => a.type === "file"),
    [questions]
  );
  const [fileUploadStatus, setFileUploadStatus] = useState<{
    [questionID: string]: UploadTaskSnapshot["state"];
  }>({});
  useLayoutEffect(() => {
    const unsubs: ReturnType<UploadTask["on"]>[] = [];
    for (let fileQuestion of fileUploadQuestions) {
      const uploadTask = answers[fileQuestion.id] as
        | AnswerByField<{
            type: "file";
          }>
        | undefined;

      if (!uploadTask)
        setFileUploadStatus((prev) => ({
          ...prev,
          [fileQuestion.id]: "running",
        }));
      else if (typeof uploadTask === "boolean") {
        setFileUploadStatus((prev) => ({
          ...prev,
          [fileQuestion.id]: "success",
        }));
      } else
        unsubs.push(
          uploadTask.on("state_changed", (r) => {
            setFileUploadStatus((prev) => ({
              ...prev,
              [fileQuestion.id]:
                r.totalBytes === r.bytesTransferred ? "success" : "running",
            }));
          })
        );
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [answers, fileUploadQuestions]);

  const areAllFileUploaded = useMemo(() => {
    return fileUploadQuestions.reduce((r, question) => {
      const uploadStatus = fileUploadStatus[question.id];
      return r && uploadStatus === "success";
    }, true);
  }, [fileUploadStatus, fileUploadQuestions]);

  return areAllFileUploaded;
}

export function useFieldErrors<
  Q extends Readonly<
    Pick<FormField, "type" | "id" | "optional" | "validator">[]
  >
>(currentQuestions: Q, answers: AnswersMap, showAllErrors: boolean) {
  const { requiredLabel } = useOneUIConfig("component.form");
  const errorMap = useMemo(() => {
    const ans = <T extends FormFieldView["type"]>(
      question: Pick<FormField, "id"> & {
        type: T;
      }
    ) =>
      answers[question.id] as AnswerByField<{
        type: T;
      }>;
    const errorsMap: {
      [questionId: string]: string | undefined;
    } = {};
    for (let question of currentQuestions) {
      const _isValidated = () => {
        return isValidated(
          ans(question),
          !!question.optional,
          question.validator,
          requiredLabel
        );
      };

      const validation = _isValidated();
      errorsMap[question.id] = validation.error;
      switch (question.type) {
        case "check":
        case "rawcheck":
          if (question.validator)
            errorsMap[question.id] = question.validator(
              ans(question) as any
            ) as string;
          break;
        case "number":
        case "text":
        case "select":
        case "radio":
        case "file":
          const validationResult = _isValidated();
          if (validationResult.error)
            errorsMap[question.id] = validationResult.error;
      }
    }

    return errorsMap;
  }, [currentQuestions, answers]);

  const currentErrors = useMemo(() => {
    return Object.entries(errorMap).reduce(
      (r, [k, v]) => ({
        ...r,
        [k]: showAllErrors ? v : v !== requiredLabel ? v : undefined,
      }),
      {}
    );
  }, [showAllErrors, errorMap]);

  return currentErrors as { [k in Q[number]["id"]]: string };
}

export function areAllQuestionsAnswered(
  currentQuestions: FormField[],
  answers: AnswersMap,
  requiredLabel: string
) {
  const isValid = currentQuestions.reduce((answeredAll, question) => {
    const ans = <T extends FormFieldView["type"]>(
      question: FormField & {
        type: T;
      }
    ) =>
      answers[question.id] as unknown as AnswerByField<{
        type: T;
      }>;

    const result =
      answeredAll &&
      (() => {
        switch (question.type) {
          case "accept":
            const checks = ans(question) || [];
            return question.accept.reduce(
              (r, { optional }, idx) => r && (optional ? true : checks[idx]),
              true
            );
          case "check":
          case "rawcheck":
            if (question.optional) return true;
            if (question.validator)
              return question.validator(ans(question) as any) as boolean;
            const checkmarks = ans(question) || [];
            return checkmarks.includes(true);
          case "number":
          case "text":
          case "select":
          case "radio":
          case "file":
            if (!answers[question.id]) return false;
            const validationResult = isValidated(
              ans(question),
              !!question.optional,
              question.validator,
              requiredLabel
            );
            return validationResult.isValid && answeredAll;
          default:
            return question.validator
              ? !!question.validator(ans(question))
              : !!ans(question);
        }
      })();
    return result;
  }, true);

  return { isValid: !!isValid };
}

export const isValidated = (
  _answer: string | [val: string, isValid: boolean, error?: string],
  isOptional: boolean,
  validator: ((val: any) => string | boolean) | undefined,
  requiredFieldLabel: string
) => {
  const answer = Array.isArray(_answer) ? _answer[0] : _answer;
  if (!answer && !isOptional)
    return {
      isValid: false,
      error: requiredFieldLabel,
    };
  if (!validator)
    if (Array.isArray(_answer)) {
      const [_, isValid, error] = _answer;
      return {
        isValid,
        error,
      };
    } else {
      return {
        isValid: true,
        error: "",
      };
    }
  const validationResult = validator(answer);
  if (typeof validationResult === "string")
    return {
      isValid: false,
      error: validationResult,
    };
  return {
    isValid: validationResult,
    error: "",
  };
};
