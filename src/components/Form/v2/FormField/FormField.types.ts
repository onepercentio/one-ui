import { ReactElement, ReactNode } from "react";
import { SelectItem } from "../../../Select/Select";
import { UploadTask } from "firebase/storage";

export type GenericFormFieldProps<T extends FormField["type"]> = {
  value: AnswerByField<{ type: T }>;
  onAnswer: (FormFieldProps<{ type: T }> & {
    mode: FormMode.WRITE;
  })["onAnswer"];
  question: FormFieldView & { type: T };
  error?: string;
};

export type FormFieldProps<Q extends Pick<FormFieldView, "type">> = {
  config: Q;
  value: AnswerByField<Q>;
} & (
  | {
      mode: FormMode.READ_ONLY;
    }
  | {
      mode?: FormMode.WRITE;
      onAnswer: <T extends Q["type"]>(
        questionType: T,
        questionId: string,
        answer:
          | AnswerAction<{
              type: T;
            }>
          | undefined
      ) => void;
      error?: string | string[];
    }
);

export enum FormMode {
  READ_ONLY,
  WRITE,
}
export type FormFieldView = FormField & {
  title: string;
};

export type AnswerAction<F extends Pick<FormField, "type">> =
  F["type"] extends "file" ? File : AnswerByField<F>;

export type BasicFormFields =
  | {
      type: "select";
      filter?: (item: SelectItem, term: string) => boolean;
      options: SelectItem[];
    }
  | {
      type: "text";
    }
  | {
      type: "number";
    };

export type FormField = {
  optional?: true;
  id: string;
  validator?: (val: AnswerAction<FormField> | undefined) => boolean | string;
} & (
  | BasicFormFields
  | {
      type: "radio";
      options: SelectItem[];
    }
  | {
      type: "check" | "rawcheck";
      options: SelectItem[];
    }
  | {
      type: "file";
      fileUsageDescription: string;
      extensions: string[];
      footer: string;
      openFile?: {
        action: () => void;
        label: string | ReactNode;
      };
    }
  | {
      type: "accept";
      link: {
        type: "file" | "route";
        to: string;
      };
      contract: {
        action: () => void;
        label: string | ReactNode;
      };
      accept: {
        label: string;
        optional?: true;
      }[];
    }
  | OnepercentUtility.UIElements.FormExtension["fields"]
);

export type AnswerByField<F extends Pick<FormField, "type">> =
  F["type"] extends "file"
    ? UploadTask | true
    : F["type"] extends "accept" | "check" | "rawcheck"
    ? boolean[]
    : F["type"] extends keyof OnepercentUtility.UIElements.FormExtension["fieldAnswer"]
    ? OnepercentUtility.UIElements.FormExtension["fieldAnswer"][F["type"]]
    : string;
