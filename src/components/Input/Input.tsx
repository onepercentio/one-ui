import React, {
  ComponentProps,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Text from "../Text";
import Styles from "./Input.module.scss";

/**
 * A transparent input with some prebuilt states common to the application
 **/
function Input(
  {
    error,
    placeholder = " ",
    hideError,
    icon,
    Icon,
    autoFocus,
    ...otherProps
  }: {
    error?: string;
    hideError?: "onfocus";
    placeholder?: string;
    icon?: {
      onClick?: () => void;
    } & DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, any>;
    Icon?: React.ReactElement;
  } & React.HTMLProps<HTMLInputElement>,
  ref: ForwardedRef<any>
) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current, []);
  const shouldShowError = useMemo(() => {
    if (hideError === "onfocus") return !focused;
    return !!error;
  }, [focused, error, hideError]);
  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => {
        inputRef.current!.focus();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);
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
      {Icon && <div className={Styles.icon}>{Icon}</div>}
      {icon && <img className={Styles.icon} {...icon} />}
    </div>
  );
}

export default forwardRef(Input);
