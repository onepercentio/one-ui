import React, {
  ComponentProps,
  DetailedHTMLProps,
  ElementRef,
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
import {
  AnchoredTooltipAlignment,
  AnchoredTooltipAnchor,
} from "../AnchoredTooltip/AnchoredTooltip";

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
  Omit<
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLElement>,
    "ref" | "color"
  >;

type SingleMode<I extends SelectItem> = {
  mode?: "single";
  onClick: (i: I) => void;
} & (
  | {
      selected?: I["value"];
      label: string;
    }
  | {
      selected: I["value"];
      label?: string;
    }
);

type MultiMode<I extends SelectItem> = {
  mode: "multi";
  onClick: (i: I[]) => void;
  selected?: I["value"][];
};

/**
 * A dropdown select
 **/
function Select<I extends SelectItem>({
  items,
  label,
  loading,
  rootClassName = "",
  dropdownClassName: _drop = "",
  alignTo = AnchoredTooltipAlignment.CENTER,
  filter,
  ...otherProps
}: {
  loading?: boolean;
  items: Readonly<I[]>;
  rootClassName?: string;
  dropdownClassName?: string;
  alignTo?: AnchoredTooltipAlignment;
  filter?: (item: I, term: string) => boolean;
} & (SingleMode<I> | MultiMode<I>) &
  Omit<ComponentProps<typeof Input>, "selected" | "onClick">) {
  const { selected: _, onClick: __, ...propsToSpread } = otherProps;
  const { StateIndicator } = useOneUIContext().component.select;
  const collapsableRef = useRef<ElementRef<typeof Collapsable>>(null);

  const _selected = useMemo(() => {
    if (otherProps.mode === "multi")
      return items.filter((a) => otherProps.selected?.includes(a.value));
    return items.find((a) => a.value === otherProps.selected);
  }, [otherProps.selected, items]);

  const [open, setOpen] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");

  const filteredItems = useMemo(() => {
    if (filter && filterTerm)
      return items.filter((item) => filter(item, filterTerm));
    else return items;
  }, [filterTerm, items]);

  useEffect(() => {
    collapsableRef.current!.redimension();
  }, [filteredItems.length]);

  useLayoutEffect(() => {
    if (open) setFilterTerm("");
  }, [open]);

  const selectClasses = _drop
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
          {...propsToSpread}
          className={`${Styles.input} ${selectClasses.input} ${
            !items.length ? Styles.empty : ""
          } ${otherProps.disabled ? Styles.disabled : ""}`}
          value={
            Array.isArray(_selected)
              ? _selected.length
                ? `(${_selected.length}) ${
                    "labelStr" in _selected[0]
                      ? _selected[0].labelStr
                      : _selected[0].label
                  }`
                : label || ""
              : _selected
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
        if (items.length && !otherProps.disabled) setOpen(open);
      }}
      className={`${otherProps.disabled ? "disabled" : ""} ${rootClassName}`}
      contentClassName={`${Styles.optionsContainer} ${selectClasses.dropdown}`}
      alignTo={alignTo}
      ref={collapsableRef}
      anchorTo={AnchoredTooltipAnchor.BOTTOM}
    >
      <div
        className={Styles.items}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(false);
        }}
      >
        {filter && (
          <div className={Styles.searchInput}>
            <Input
              onChange={({ target: { value } }) => setFilterTerm(value)}
              decoration={<span>🔎&nbsp;</span>}
              containerProps={{
                onClick: (e) => e.stopPropagation(),
              }}
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
                ? `${Styles.selected} ${selectClasses.selectedItem}`
                : ""
            } ${selectClasses.item || ""}`}
            onClick={() => {
              if (otherProps.mode === "multi") {
                const curr = otherProps.selected || [];
                otherProps.onClick([
                  ...curr.map((iId) => items.find((i) => i.value === iId)!),
                  i,
                ]);
              } else otherProps.onClick(i);
            }}
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
