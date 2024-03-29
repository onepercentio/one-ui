import React, {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import Input from "../Input";

export function validateEmail(email: string) {
  return /@.*\./.test(email);
}
function _EmailInput(
  props: Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
    onChange: (email: string, isValid: boolean) => void;
    value: string;
    messages: {
      invalidEmail: string;
    };
  },
  ref: ForwardedRef<{
    validateEmail: (email: string) => boolean;
  }>
) {
  const [localWarning, setLocalWarning] = useState(
    props.value ? !validateEmail(props.value) : false
  );
  useImperativeHandle(ref, () => ({
    validateEmail: validateEmail,
  }));
  function _handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    props.onChange(e.target.value, validateEmail(e.target.value));
  }
  return (
    <Input
      {...props}
      error={localWarning ? props.messages.invalidEmail : props.error}
      onBlur={({ target: { value } }) => {
        setLocalWarning(!!value && !validateEmail(value));
      }}
      onFocus={() => setLocalWarning(false)}
      onChange={_handleInputChange}
    />
  );
}

/**
 * A Input based wrapper to handle inputs of email
 **/
const EmailInput = forwardRef(_EmailInput);
export default EmailInput;
