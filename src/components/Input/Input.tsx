import React, {
  ChangeEventHandler,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  ReactElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Text from "../Text";
import Styles from "./Input.module.scss";

export type InputProps = {
  decoration?: React.ReactElement | null;
  error?: string | ReactElement;
  hideError?: "onfocus";
  placeholder?: string;
  disclaimer?: string | ReactElement;
  multiline?: number;
  icon?: {
    onClick?: () => void;
  } & DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, any>;
  Icon?: React.ReactElement;
  onChange?: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  containerProps?: Omit<React.HTMLProps<HTMLDivElement>, "ref">;
  value?: string;
  "data-testid"?: string;
} & Omit<
  React.HTMLProps<HTMLInputElement | HTMLTextAreaElement>,
  "ref" | "onChange" | "value"
>;
function _Input(
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
    containerProps,
    className: localClassName,
    ...otherProps
  }: InputProps,
  ref: ForwardedRef<any>
) {
  const className = useOneUIConfig("component.input.className", {});
  const variants = useOneUIConfig("component.input.labelVariants", {});
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
  return (
    <div
      className={`${Styles.inputContainer} ${false ? Styles.withIcon : ""} ${
        className.container
      } ${localClassName}`}
      {...containerProps}
    >
      {decoration}
      <Component
        ref={inputRef as any}
        placeholder={placeholder}
        rows={multiline}
        className={className.input}
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
      {error && shouldShowError ? (
        <Text
          title={typeof error === "string" ? error : ""}
          className={Styles.caption}
          type={variants.error ?? "error"}
        >
          {error}
        </Text>
      ) : disclaimer ? (
        <Text
          title={typeof disclaimer === "string" ? disclaimer : ""}
          type={variants.disclaimer ?? "caption"}
          className={Styles.caption}
        >
          {disclaimer}
        </Text>
      ) : null}
      {Icon && <div className={Styles.icon}>{Icon}</div>}
      {icon && <img className={Styles.icon} {...icon} />}
    </div>
  );
}

/**
 * A transparent input with some prebuilt states common to the application
 **/
const Input = forwardRef(_Input);
export default Input;
