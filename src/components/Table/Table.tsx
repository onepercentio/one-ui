import React, {
  createContext,
  ElementRef,
  PropsWithChildren,
  ReactElement,
  useContext,
  useMemo,
  useRef,
} from "react";
import { useOneUIContext } from "../../context/OneUIProvider";
import Button from "../Button";
import Spacing from "../Spacing";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./Table.module.scss";

export type TableProps<I extends any> = {
  className?: string;
  heading: {
    [K in keyof I]?: string;
  };
  order: (keyof I)[];
  items: (I & { className?: string })[];
  paginable?: {
    currentPage: number;
    totalItems: number;
    togglePage: (page: number) => void;
  };
};

/**
 * A simple table layout
 **/
export default function Table<I extends any>({
  paginable,
  heading,
  order,
  items,
  className = "",
}: TableProps<I>) {
  const transitionRef = useRef<
    ElementRef<typeof UncontrolledTransition> | HTMLDivElement
  >(null);
  const {
    controls: {
      NextPage = ({ disabled }) => (
        <Button disabled={disabled} variant="filled">
          {">"}
        </Button>
      ),
      PrevPage = ({ disabled }) => (
        <Button disabled={disabled} variant="filled">
          {"<"}
        </Button>
      ),
    },
  } = useOneUIContext().component.table;

  const { items: itemsToShow, pages } = useMemo(() => {
    if (paginable) {
      const numPages = Math.ceil(paginable.totalItems / 5);

      return {
        items: items.slice(
          (paginable.currentPage - 1) * 5,
          (paginable.currentPage - 1) * 5 + 5
        ),
        pages: numPages,
      };
    }
    return {
      items: items,
    };
  }, [items, paginable?.currentPage, paginable?.totalItems]);

  const Wrapper = paginable ? UncontrolledTransition : "div";

  return (
    <>
      <TableContext.Provider
        value={{
          itemsToShow,
          keys: order,
          heading,
        }}
      >
        <Wrapper
          className={Styles.transitionContainer}
          ref={transitionRef as any}
        >
          <TableComp key={paginable?.currentPage} className={className} />
        </Wrapper>
      </TableContext.Provider>
      {paginable && paginable.totalItems > 5 ? (
        <>
          <Spacing size="small" />
          <div className={Styles.footer} data-testid="controls">
            <span
              className={Styles.iterable}
              onClick={() => {
                if (!(transitionRef.current instanceof HTMLDivElement))
                  transitionRef.current!.setOrientation("backward");
                paginable.togglePage(paginable.currentPage - 1);
              }}
            >
              <PrevPage disabled={paginable.currentPage === 1} />
            </span>
            <span className={Styles.paging}>{`${paginable.currentPage}/${pages}`}</span>
            <span
              className={Styles.iterable}
              onClick={() => {
                if (!(transitionRef.current instanceof HTMLDivElement))
                  transitionRef.current!.setOrientation("forward");
                paginable.togglePage(paginable.currentPage + 1);
              }}
            >
              <NextPage disabled={paginable.currentPage === pages} />
            </span>
          </div>
        </>
      ) : null}
    </>
  );
}

const TableContext = createContext<{
  itemsToShow: any[];
  keys: any[];
  heading: { [k: string]: string | undefined };
}>(null as any);

function TableComp({ className }: { className: string }) {
  const { itemsToShow, keys, heading } = useContext(TableContext);
  return (
    <table className={`${Styles.container} ${className}`}>
      <thead>
        <tr>
          {keys.map((key) => (
            <th key={String(key)}>{heading[key]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {itemsToShow.map((i, index) => (
          <tr key={String(index)} className={i.className}>
            {keys.map((key) => (
              <td key={String(key)}>{i[key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
