import React, { useMemo, useState } from "react";
import Collapsable from "../Collapsable";
import Text from "../Text";
import InputStyles from "../Input/Input.module.scss";
import Styles from "./Select.module.scss";
import Input from "../Input";
import Loader from "../Loader";

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
  const _selected = useMemo(() => {
    return items.find((a) => a.value === selected);
  }, [selected]);
  const [open, setOpen] = useState(false);
  return (
    <Collapsable
      title={
        <Input
          value={_selected?.label || label}
          disabled
          Icon={loading ? <Loader /> : undefined}
        />
      }
      id={undefined}
      mode="float"
      open={open}
      onToggleOpen={setOpen}
    >
      <div className={Styles.items}>
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
