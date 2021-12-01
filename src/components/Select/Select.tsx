import React, { useEffect, useMemo, useState } from "react";
import Collapsable from "../Collapsable";
import Text from "../Text";
import InputStyles from "../Input/Input.module.scss";
import Styles from "./Select.module.scss";
import Input from "../Input";
import Loader from "../Loader";
import { useOneUIContext } from "../../context/OneUIProvider";

export type SelectItem = {
  label: string;
  value: string;
};

/**
 * A dropdown select
 **/
export default function Select<I extends SelectItem>({
  items,
  selected,
  label,
  onClick,
  loading,
}: {
  loading?: boolean;
  items: Readonly<I[]>;
  onClick: (i: I) => void;
} & (
  | {
      selected?: SelectItem["value"];
      label: string;
    }
  | {
      selected: SelectItem["value"];
      label?: string;
    }
)) {
  const { DropdownIndicator } = useOneUIContext().component.select;
  const _selected = useMemo(() => {
    return items.find((a) => a.value === selected);
  }, [selected]);
  const [open, setOpen] = useState(false);

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
          className={`${Styles.input} ${!items.length ? Styles.empty : ""}`}
          value={_selected?.label || label}
          disabled
          Icon={
            <div
              className={`${Styles.indicator} ${
                open && !loading ? Styles.open : ""
              }`}
            >
              {loading ? <Loader /> : <DropdownIndicator />}
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
            className={i === _selected ? Styles.selected : ""}
            onClick={() => onClick(i)}
          >
            {i.label}
          </Text>
        ))}
      </div>
    </Collapsable>
  );
}
