import React, {
  ComponentProps,
  ForwardedRef,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import Collapsable from "../Collapsable";
import Text from "../Text";
import Styles from "./Select.module.scss";
import Input from "../Input";
import Loader from "../Loader";
import {
  OneUIContextSpecs,
  useOneUIConfig,
  useOneUIContext,
} from "../../context/OneUIProvider";

export type SelectItem = {
  label: string;
  value: string;
};

/**
 * A dropdown select
 **/
function Select<I extends SelectItem>({
  items,
  selected,
  label,
  onClick,
  loading,
  rootClassName = "",
  dropdownClassName: _drop = "",
  ...otherProps
}: {
  loading?: boolean;
  items: Readonly<I[]>;
  onClick: (i: I) => void;
  rootClassName?: string;
  dropdownClassName?: string;
} & (
  | {
      selected?: I["value"];
      label: string;
    }
  | {
      selected: I["value"];
      label?: string;
    }
) &
  Omit<ComponentProps<typeof Input>, "selected" | "onClick">) {
  const { StateIndicator } = useOneUIContext().component.select;

  const _selected = useMemo(() => {
    return items.find((a) => a.value === selected);
  }, [selected, items]);

  const [open, setOpen] = useState(false);

  const dropdownClassNames = _drop
    ? ({
        dropdown: _drop,
      } as NonNullable<OneUIContextSpecs["component"]["select"]["className"]>)
    : useOneUIConfig("component.select.className", {});

  useEffect(() => {
    if (open) {
      const close = () => {
        setOpen(false);
      };
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [open]);

  return (
    <Collapsable
      title={
        <Input
          {...otherProps}
          className={`${Styles.input} ${!items.length ? Styles.empty : ""}`}
          value={_selected?.label || label}
          disabled
          Icon={
            <div className={`${Styles.indicator}`}>
              {loading ? <Loader /> : <StateIndicator open={!!open} />}
            </div>
          }
        />
      }
      id={undefined}
      mode="float"
      open={open}
      onToggleOpen={(open) => {
        if (items.length) setOpen(open);
      }}
      className={`${otherProps.disabled ? "disabled" : ""} ${rootClassName}`}
      contentClassName={`${Styles.optionsContainer} ${dropdownClassNames.dropdown}`}
    >
      <div
        className={Styles.items}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
      >
        {items.map((i) => (
          <Text
            type="caption"
            key={i.value}
            className={`${
              i === _selected
                ? `${Styles.selected} ${dropdownClassNames.selectedItem}`
                : ""
            } ${dropdownClassNames.item || ""}`}
            onClick={() => onClick(i)}
          >
            {i.label}
          </Text>
        ))}
      </div>
    </Collapsable>
  );
}

export default forwardRef((props: any, ref: any) => (
  <Select {...props} />
)) as typeof Select;
