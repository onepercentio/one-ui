import React, {
  ChangeEventHandler,
  ReactElement,
  useCallback,
  useRef,
} from "react";
import Styles from "./BigFactory.module.scss";
import { FileInputViewProps } from "../View.types";
import Spacing from "../../../Spacing/Spacing";
import Text from "../../../Text/Text";
import Button from "../../../Button/Button";

/**
 * The file input layout with a big appearance
 **/
export default function BigFactory(IconComponent: () => ReactElement) {
  return function Big({
    states: {
      fileProvided: { title: fileProvided, button: removeFile },
      waitingFile: { button, title: reason },
    },
    file,
    footer,
    className,
    inputEl,
    onAction: onRemoveFile
  }: FileInputViewProps) {
    return (
      <div className={`${Styles.container} ${className ?? ""}`}>
        <IconComponent />
        <Spacing size="small" />
        <Text type="description">{file ? fileProvided : reason}</Text>
        <Spacing size="small" />
        <Button
          variant="filled"
          onClick={onRemoveFile}
        >
          {file ? removeFile : button}
        </Button>
        {inputEl}

        <Text className={Styles.footer} type="caption">
          {footer}
        </Text>
      </div>
    );
  };
}
