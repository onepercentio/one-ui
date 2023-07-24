import React, { ChangeEventHandler, useCallback, useRef } from "react";
import { useOneUIView } from "../../context/OneUIProvider";
import Styles from "./FileInput.module.scss";

export type FileInputProps = {
  states: {
    waitingFile: {
      /** The reason why this file is being requested */
      title: string;
      /** Shown below the title */
      description?: string;
      /** The label to show on the button */
      button?: string;
    };
    fileProvided: {
      /** Text show when the file has been provided */
      title: string;
      /** Shown below the title */
      description?: string;
      /** Shown on the button to remove the file */
      button?: string;
    };
  };
  footer: string;
  file?: File;
  onFile: (file: File | undefined) => void;
  progress?: number;
} & React.HTMLProps<HTMLInputElement>;

/**
 * A component to provide the upload of a file
 **/
export default function FileInput({ onFile, ...props }: FileInputProps) {
  const View = useOneUIView("component.fileInput.View", "FileInput");
  const inputRef = useRef<HTMLInputElement>(null);

  const onFileSelected = useCallback(
    ((e) => {
      const file = e.target.files!.item(0);
      onFile(file || undefined);
    }) as ChangeEventHandler<HTMLInputElement>,
    []
  );

  return (
    <View
      {...props}
      onAction={() => {
        if (props.file) {
          inputRef.current!.value = "";
          onFile(undefined);
        } else {
          inputRef.current!.click();
        }
      }}
      inputEl={
        <input
          {...props}
          ref={inputRef}
          onChange={onFileSelected}
          type={"file"}
          className={Styles.hidden}
        />
      }
    />
  );
}
