import React, {
  ComponentProps,
  DetailedHTMLProps,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Text from "../Text";
import Styles from "./Input.module.scss";

/**
 * A transparent input with some prebuilt states common to the application
 **/
export default function Input({
  error,
  placeholder = " ",
  hideError,
  icon,
  ...otherProps
}: {
  error?: string;
  hideError?: "onfocus";
  placeholder?: string;
  icon?: {
    onClick?: () => void;
  } & DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, any>;
} & React.HTMLProps<HTMLInputElement>) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldShowError = useMemo(() => {
    if (hideError === "onfocus") return !focused;
    return !!error;
  }, [focused, error, hideError]);
  useEffect(() => {
    const t = setTimeout(() => {
      inputRef.current!.focus();
    }, 500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`${Styles.inputContainer} ${false ? Styles.withIcon : ""}`}>
      <input
        ref={inputRef}
        placeholder={placeholder}
        {...otherProps}
        onFocus={(e) => {
          setFocused(true);
          if (otherProps.onFocus) otherProps.onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (otherProps.onBlur) otherProps.onBlur(e);
        }}
      />
      <div className={Styles.border} />
      {error && shouldShowError && (
        <Text
          title={error}
          data-testid="error-label"
          className={Styles.error}
          type="error"
        >
          {error}
        </Text>
      )}
      {icon && <img className={Styles.icon} {...icon} />}
    </div>
  );
}
