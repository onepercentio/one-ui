import React, { useState } from "react";
import Collapsable from "../Collapsable";
import Text from "../Text";
import Styles from "./Select.module.scss";

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
}: {
  items: Readonly<I[]>;
  onClick: (i: I) => void;
} & (
  | {
      selected?: I;
      label: string;
    }
  | {
      selected: I;
      label?: string;
    }
)) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsable
      title={label || selected!.label}
      className={Styles.container}
      id={undefined}
      mode="float"
      open={open}
      onToggleOpen={setOpen}
    >
      <div className={Styles.items}>
        {items.map((i) => (
          <Text
            type="caption"
            className={i === selected ? Styles.selected : ""}
            onClick={() => onClick(i)}
          >
            {i.label}
          </Text>
        ))}
      </div>
    </Collapsable>
  );
}
