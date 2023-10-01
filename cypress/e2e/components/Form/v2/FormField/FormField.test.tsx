import FormField from "components/Form/v2/FormField";
import dateFieldFactory, {
  dateFieldValidatorFactory,
} from "components/Form/v2/FormField/Extensions/DateField/DateField";
import phoneFieldFactory, { phoneFieldValidator } from "components/Form/v2/FormField/Extensions/PhoneField/PhoneField";
import { FormMode } from "components/Form/v2/FormField/FormField.types";
import OneUIProvider, { OneUIContextSpecs } from "context/OneUIProvider";
import { useState } from "react";

it("Should be able to render field", () => {
  cy.mount(
    <OneUIProvider
      config={{
        component: {
          form: {
            titleVariant: "highlightTitle",
            optionalLabel: "This is optional",
            labelVariant: "boldTitleBig",
          },
        },
      }}
    >
      <>
        <FormField
          config={{ type: "text", id: "some_id", title: "This is a title" }}
          mode={FormMode.READ_ONLY}
          value="XPTO"
        />

        <FormField
          config={{ type: "text", id: "some_id", title: "This is a title" }}
          mode={FormMode.WRITE}
          onAnswer={cy.spy()}
          value="XPTO"
          error={"This is an error"}
        />
      </>
    </OneUIProvider>
  );
});

it.only("Should be able to extend", () => {
  const chain = cy.mountChain(
    (extension: OneUIContextSpecs["component"]["form"]["extensions"]) => {
      function Wrapper() {
        const [s, ss] = useState<
          OnepercentUtility.UIElements.FormExtension["fieldAnswer"]["phone"]
        >(["", false, undefined]);
        return (
          <FormField
            config={{
              type: "phone",
              id: "phone_input",
              title: "This is a phone input",
              country: "BR",
            }}
            onAnswer={cy.spy((_, __, a) => ss(a))}
            value={s}
            error={s[2]}
          />
        );
      }
      function DateWrapper() {
        const [s, ss] = useState("");
        return (
          <FormField
            config={{
              type: "date",
              id: "phone_input",
              title: "This is a date input",
            }}
            onAnswer={cy.spy((_, __, a) => ss(a))}
            value={s}
          />
        );
      }
      return (
        <OneUIProvider
          config={{
            component: {
              form: {
                titleVariant: "highlightTitle",
                optionalLabel: "This is optional",
                labelVariant: "boldTitleBig",
                extensions: extension,
              },
            },
          }}
        >
          <Wrapper />
          <DateWrapper />
        </OneUIProvider>
      );
    }
  );
  chain.remount({
    phone: {
      Input: phoneFieldFactory("This phone is invalid"),
      validator: phoneFieldValidator,
    },
    date: {
      Input: dateFieldFactory("99/99/9999"),
      validator: dateFieldValidatorFactory("Invalid date", "Required field"),
    },
  });
});
