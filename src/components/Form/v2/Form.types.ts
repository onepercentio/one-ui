import { SelectItem } from "../../Select/Select";
import { UploadTask } from "firebase/storage";
import { ReactElement } from "react";

import {
  AnswerAction,
  AnswerByField,
  FormField,
} from "./FormField/FormField.types";

export type BaseQuestion = { id: string; type: FormField["type"] };
export type FormState<Q extends BaseQuestion[] = []> = [
  answers: AnswersMap<Q>,
  isValid: boolean
];

export enum DataStatus {
  /** Form is empty */
  PENDING,
  /** Form is partially filled */
  INCOMPLETE,
  /** Form is completed */
  COMPLETE,
  /** Form has error */
  ERROR,
}

export enum StepStatus {
  /** When the data is empty and needs to be filled */
  INCOMPLETE,
  /** When data has already been filled */
  COMPLETED,
  /** When the step is the current selected */
  CURRENT,
  /** When the step has error */
  ERROR,
}

export enum FormStep {
  PERSONAL_DATA,
  ADDITIONAL_DATA,
  DOCUMENTS,
  INVEST_PROFILE,
  CONTRACTS,
}

export enum FormMode {
  READ_ONLY,
  WRITE,
}

export type FormFieldView = FormField & {
  title: string;
};

export type FormProps = {
  onFormSubmitted: () => void;
  savedAnswers: Partial<{
    [questionId: string]: AnswerByField<FormField>;
  }>;
  startAt: FormStep;
  onGoBack: () => void;
};
export type StepFormProps = Pick<FormProps, "savedAnswers"> & {
  step: FormStep;
} & ModeProps;

export type ModeProps =
  | {
      mode: FormMode.READ_ONLY;
    }
  | {
      mode: FormMode.WRITE;
      onFinish: () => void;
      onCancel: () => void;
    };
export type FormViewProps<Q extends BaseQuestion[]> = {
  questions: Q;
} & (
  | {
      mode?: FormMode.WRITE;
      initialAnswers?: AnswersMap;
      onFormUpdate: (...args: FormState<Q>) => void;
      /** When provided (true) show all current errors that are blocking the completion of the form */
      showAllErrors?: boolean;
    }
  | {
      initialAnswers: AnswersMap;
      mode: FormMode.READ_ONLY;
    }
);

export type AnswersMap<Q extends Readonly<BaseQuestion[]> = []> = Partial<
  {
    [questionId in Q[number]["id"]]: AnswerByField<
      Q[number] & { id: questionId }
    >;
  }
>;

export enum INVESTOR_PROFILE {
  /**
   * User can only spend up to 20k
   */
  RESTRICTED,
  /**
   * User can only spend up to 10% of it's income
   */
  LIMITED,
  /**
   * User doesn't have restrictions
   */
  UNLIMITED,
}
