import React, {
  ComponentProps,
  DetailedHTMLProps,
  ElementRef,
  ForwardedRef,
  forwardRef,
  Fragment,
  HTMLAttributes,
  ReactElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import { AnchoredTooltipAlignment } from "../AnchoredTooltip/AnchoredTooltip";
import UncontrolledTransition from "../UncontrolledTransition/UncontrolledTransition";
import { TransitionAnimationTypes } from "../Transition";

export type SelectItem = (
  | {
      label: string;
      value: string;
    }
  | {
      label: ReactElement;
      labelStr: string;
      value: string;
    }
) &
  Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLElement>, "ref">;

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
  alignTo = AnchoredTooltipAlignment.CENTER,
  filter,
  ...otherProps
}: {
  loading?: boolean;
  items: Readonly<I[]>;
  onClick: (i: I) => void;
  rootClassName?: string;
  dropdownClassName?: string;
  alignTo?: AnchoredTooltipAlignment;
  filter?: (item: I, term: string) => boolean;
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
  const collapsableRef = useRef<ElementRef<typeof Collapsable>>(null);

  const _selected = useMemo(() => {
    return items.find((a) => a.value === selected);
  }, [selected, items]);

  const [open, setOpen] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (filter && filterTerm)
      return items.filter((item) => filter(item, filterTerm));
    else return items;
  }, [filterTerm]);

  useEffect(() => {
    collapsableRef.current!.redimension();
  }, [filteredItems.length]);

  useLayoutEffect(() => {
    if (open) setFilterTerm("");
  }, [open]);

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
          value={
            _selected
              ? "labelStr" in _selected
                ? _selected.labelStr
                : _selected.label
              : label || ""
          }
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
      alignTo={alignTo}
      ref={collapsableRef}
    >
      <div
        className={Styles.items}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
      >
        {filter && (
          <div>
            <Input
              onChange={({ target: { value } }) => setFilterTerm(value)}
              decoration={<span>🔎&nbsp;</span>}
              className={Styles.searchInput}
              containerProps={{
                onClick: (e) => e.stopPropagation(),
              }}
              border={false}
              value={filterTerm}
            />
          </div>
        )}
        {filteredItems.map((i) => (
          <Text
            type="caption"
            key={i.value}
            className={`${
              i === _selected
                ? `${Styles.selected} ${dropdownClassNames.selectedItem}`
                : ""
            } ${dropdownClassNames.item || ""}`}
            onClick={() => onClick(i)}
            {...i}
          >
            {i.label}
          </Text>
        ))}
      </div>
    </Collapsable>
  );
}

export default Select;
