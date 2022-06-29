import React, {
  ChangeEventHandler,
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
import { useOneUIConfig, useOneUIContext } from "../../context/OneUIProvider";
import Text from "../Text";
import Styles from "./Input.module.scss";

export type InputProps = {
  decoration?: React.ReactElement | null;
  error?: string;
  hideError?: "onfocus";
  placeholder?: string;
  disclaimer?: string;
  multiline?: number;
  border?: boolean;
  icon?: {
    onClick?: () => void;
  } & DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, any>;
  Icon?: React.ReactElement;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
} & Omit<
  React.HTMLProps<HTMLInputElement | HTMLTextAreaElement>,
  "ref" | "onChange"
>;

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
    multiline,
    decoration = null,
    border: propBorder,
    ...otherProps
  }: InputProps,
  ref: ForwardedRef<any>
) {
  const className = useOneUIConfig("component.input.className");
  const globalBorder = useOneUIConfig("component.input.border");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
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
  const Component = multiline ? "textarea" : "input";
  const withBorder = useMemo(() => {
    if (propBorder !== undefined) return propBorder;
    return globalBorder;
  }, [propBorder, globalBorder]);
  return (
    <div
      className={`${Styles.inputContainer} ${
        false ? Styles.withIcon : ""
      } ${className}`}
    >
      {decoration}
      <Component
        ref={inputRef as any}
        placeholder={placeholder}
        rows={multiline}
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
      {withBorder && <div className={Styles.border} />}
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
