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

export type InputProps = {
  error?: string;
  hideError?: "onfocus";
  placeholder?: string;
  disclaimer?: string;
  icon?: {
    onClick?: () => void;
  } & DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, any>;
  Icon?: React.ReactElement;
} & Omit<React.HTMLProps<HTMLInputElement>, 'ref'>;

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
    disclaimer,
    ...otherProps
  }: InputProps,
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
      {error && shouldShowError ? (
        <Text
          title={error}
          data-testid={InputTestIds.ERROR}
          className={Styles.caption}
          type="error"
        >
          {error}
        </Text>
      ) : disclaimer ? (
        <Text
          title={disclaimer}
          type="caption"
          className={Styles.caption}
          data-testid={InputTestIds.DISCLAIMER}
        >
          {disclaimer}
        </Text>
      ) : null}
      {Icon && <div className={Styles.icon}>{Icon}</div>}
      {icon && <img className={Styles.icon} {...icon} />}
    </div>
  );
}

export enum InputTestIds {
  DISCLAIMER = "disclaimer",
  ERROR = "error",
}

export default forwardRef(Input);
