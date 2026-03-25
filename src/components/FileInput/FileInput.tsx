import React, {
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useRef,
} from "react";
import { useOneUIView } from "../../context/OneUIProvider";
import Styles from "./FileInput.module.scss";

export type FileInputProps = {
  states: {
    waitingFile: {
      /** The reason why this file is being requested */
      title: string | ReactElement;
      /** Shown below the title */
      description?: string;
      /** The label to show on the button */
      button?: string;
    };
    fileProvided: {
      /** Text show when the file has been provided */
      title: string | ReactElement;
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
  disabled?: boolean;
} & React.HTMLProps<HTMLInputElement>;

/**
 * A component to provide the upload of a file
 **/
function FileInput({ onFile, ...props }: FileInputProps) {
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

/**
 * A simple file uploader that lets users select and upload files from their device.
 */
export default FileInput;
