import React, {
  ChangeEventHandler,
  ComponentRef,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  Fragment,
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
import AdaptiveContainer from "../AdaptiveContainer";

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
  ref: ForwardedRef<any>,
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
  const containerRef = useRef<ComponentRef<"div">>(null);
  const maxWidth = useMemo(
    () => containerRef.current?.getBoundingClientRect().width,
    [error, disclaimer],
  );
  return (
    <div className={`${className.container} ${localClassName}`}>
      <div
        className={`${Styles.inputContainer} ${false ? Styles.withIcon : ""}`}
        ref={containerRef}
        {...containerProps}
      >
        {decoration}
        <Component
          ref={inputRef as any}
          placeholder={placeholder}
          rows={multiline}
          className={`${className.input}${error && shouldShowError ? ` ${className.error ?? ""}` : ""}`}
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
        {Icon && <div className={Styles.icon}>{Icon}</div>}
        {icon && <img className={Styles.icon} {...icon} />}
      </div>
      <AdaptiveContainer direction="v" style={{ maxWidth: maxWidth }}>
        {error && shouldShowError ? (
          <Text
            key={"error"}
            title={typeof error === "string" ? error : ""}
            type={variants.error ?? "error"}
          >
            {error}
          </Text>
        ) : disclaimer ? (
          <Text
            key={"t"}
            title={typeof disclaimer === "string" ? disclaimer : ""}
            type={variants.disclaimer ?? "caption"}
          >
            {disclaimer}
          </Text>
        ) : (
          <Fragment key={"e"} />
        )}
      </AdaptiveContainer>
    </div>
  );
}

/**
 * A transparent input with some prebuilt states common to the application
 **/
/**
 * A simple text input component that users can type into.
 * It supports both single-line and multi-line text entry,
 * displays error messages when needed, and can show icons or
 * custom decorations next to the input field.
 */
const Input = forwardRef(_Input);
export default Input;
