import { ReactNode } from "react";
import { FileInputProps } from "../FileInput";

export type FileInputViewProps = {
  inputEl: ReactNode;
  onAction: () => void;
  /** A range from 0-100 to indicate some file upload progress */
  progress?: number;
} & Pick<
  FileInputProps,
  "states" | "file" | "footer" | "className" | "disabled"
>;
