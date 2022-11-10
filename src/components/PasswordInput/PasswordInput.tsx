import React, {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Input from "../Input";
import Text from "../Text";
import Styles from "./PasswordInput.module.scss";

export type AVAILABLE_PASSWORD_VALIDATION_RULES = "size" | "duplication";

const BASE_VALIDATION = [
  { code: "size", validate: (pass: string) => pass.length >= 8 },
] as const;
const RULES = [
  {
    code: "duplication",
    validate: (pass: string) => {
      for (let i = 0; i < pass.length; i++) {
        const charCode = pass.charCodeAt(i);
        const [firstNext, secondNext] = [
          pass.charCodeAt(i + 1) || 0,
          pass.charCodeAt(i + 2) || 0,
        ];

        if (firstNext - charCode === 1 && secondNext - firstNext === 1) {
          return false;
        }
      }
      return true;
    },
  },
  ...BASE_VALIDATION,
] as const;

/**
 * A Input based wrapper to handle inputing of password
 **/
function PasswordInput(
  props: ({
    value: string;
    error?: string;
  } & (
    | {
        mode: "input";
        onChange: (password: string) => void;
      }
    | {
        mode: "creation";
        onChange: (password: string, isValid: boolean) => void;
        messages: {
          invalidRules: { [r in AVAILABLE_PASSWORD_VALIDATION_RULES]: string };
          rulesTitle: string;
        };
      }
    | {
        mode: "comparision";
        otherPassword: string;
        onChange: (password: string, isEqual: boolean) => void;
        messages: {
          passwordsAreDifferent: string;
        };
      }
  )) &
    Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "ref">,
  ref: ForwardedRef<{ validatePassword: (pass: string) => boolean }>
) {
  const [isPasswordVisibile, setIPV] = useState(false);
  const { passwordHidden, passwordVisible } = useOneUIConfig(
    "component.passwordInput.iconSrc"
  );
  function _validatePassword(password: string) {
    switch (props.mode) {
      case "creation":
        return RULES.reduce(
          (isValid, R) => isValid && R.validate(password),
          true as boolean
        );
      case "comparision":
        return password === props.otherPassword;
      case "input":
        return BASE_VALIDATION.reduce(
          (isValid, R) => isValid && R.validate(password),
          true as boolean
        );
    }
  }

  useImperativeHandle(ref, () => ({
    validatePassword: (pass) => _validatePassword(pass),
  }));

  function _onChange(e: ChangeEvent<HTMLInputElement>) {
    const password = e.target.value;
    switch (props.mode) {
      case "comparision":
      case "creation":
        props.onChange(password, _validatePassword(password));
        break;
      case "input":
        props.onChange(password);
        break;
    }
  }

  return (
    <div className={`${Styles.inputContainer} ${Styles[props.mode]} ${Styles.icon}`}>
      <Input
        value={props.value}
        onChange={_onChange}
        type={!isPasswordVisibile ? "password" : ""}
        icon={{
          src: isPasswordVisibile ? passwordHidden : passwordVisible,
          onMouseLeave: () => setIPV(false),
          onMouseDown: () => setIPV(true),
          onMouseUp: () => setIPV(false),
          onTouchMove: () => setIPV(false),
          onTouchStart: () => setIPV(true),
          onTouchEnd: () => setIPV(false),
        }}
        error={
          props.mode === "comparision" && !_validatePassword(props.value)
            ? props.messages.passwordsAreDifferent
            : props.error
        }
        disabled={props.disabled}
        placeholder={props.placeholder}
      />
      {props.mode === "creation" && (
        <div className={Styles.rules} data-testid="password-rules">
          <Text type="caption">{props.messages.rulesTitle}</Text>
          {RULES.map((R) => (
            <Text
              key={R.code}
              type={R.validate(props.value) ? "caption" : "error"}
            >
              - {props.messages.invalidRules[R.code]}
            </Text>
          ))}
        </div>
      )}
    </div>
  );
}

export default forwardRef(PasswordInput);
