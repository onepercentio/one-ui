import React, {
  ChangeEventHandler,
  ComponentProps,
  useCallback,
  useRef,
} from "react";
import { useOneUIContext } from "../../context/OneUIProvider";
import Button from "../Button";
import Spacing from "../Spacing";
import Text from "../Text";
import Styles from "./FileInput.module.scss";

/**
 * A component to provide the upload of a file
 **/
export default function FileInput({
  reason,
  uploadAction,
  removeAction,
  fileProvided,
  file,
  onFile,
  ...props
}: {
  reason: string;
  uploadAction: string;
  removeAction: string;
  fileProvided: string;
  file?: File;
  onFile: (file: File | undefined) => void;
} & React.HTMLProps<HTMLInputElement>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    component: {
      fileInput: { Icon = () => null },
    },
  } = useOneUIContext();

  const onFileSelected = useCallback(
    ((e) => {
      const file = e.target.files!.item(0);
      onFile(file || undefined);
    }) as ChangeEventHandler<HTMLInputElement>,
    []
  );

  return (
    <>
      <Icon />
      <Spacing size="small" />
      <Text type="description">{file ? fileProvided : reason}</Text>
      <Spacing size="small" />
      <Button
        variant="filled"
        onClick={() => {
          if (file) {
            inputRef.current!.value = "";
            onFile(undefined);
          } else {
            inputRef.current!.click();
          }
        }}
      >
        {file ? removeAction : uploadAction}
      </Button>
      <input
        {...props}
        ref={inputRef}
        onChange={onFileSelected}
        type={"file"}
        className={Styles.hidden}
      />
    </>
  );
}
