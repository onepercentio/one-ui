import React, {
  createContext,
  ElementRef,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useOneUIConfig } from "../../context/OneUIProvider";
import Spacing from "../Spacing";
import UncontrolledTransition from "../UncontrolledTransition";
import Styles from "./Table.module.scss";

export type TableProps<I extends any> = {
  /** The list of items to render on the table */
  items: (I & { className?: string })[] | undefined;
  className?: string;
  /** A map of header ID */
  heading: {
    [K in keyof I]?: string;
  };
  order: (keyof I)[];
  paginable?: {
    totalItems: number;
    togglePage: (page: number) => void;
    pageSize: number;
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

  const [currPage, setCurrPage] = useState(0);

  const { NextPage, PrevPage } = useOneUIConfig("component.table.controls");
  const itemsToShow = useMemo(() => {
    if (paginable) {
      const from = currPage * paginable.pageSize;
      return items?.slice(from, from + paginable.pageSize) || [];
    } else {
      return items;
    }
  }, [items, currPage]);

  const { pages } = useMemo(() => {
    if (paginable) {
      const numPages = Math.ceil(paginable.totalItems / paginable.pageSize);

      return {
        pages: numPages,
      };
    }
    return {
      items: items,
    };
  }, [items, currPage, paginable?.totalItems]);

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
          <TableComp key={currPage} className={className} />
        </Wrapper>
      </TableContext.Provider>
      {paginable && paginable.totalItems > paginable.pageSize ? (
        <>
          <Spacing size="small" />
          <div className={Styles.footer} data-testid="controls">
            <span
              className={Styles.iterable}
              onClick={() => {
                if (!(transitionRef.current instanceof HTMLDivElement))
                  transitionRef.current!.setOrientation("backward");
                paginable.togglePage(currPage - 1);
                setCurrPage(currPage - 1);
              }}
            >
              <PrevPage disabled={currPage === 0} />
            </span>
            <span className={Styles.paging}>{`${currPage + 1}/${pages}`}</span>
            <span
              className={Styles.iterable}
              onClick={() => {
                if (!(transitionRef.current instanceof HTMLDivElement))
                  transitionRef.current!.setOrientation("forward");
                paginable.togglePage(currPage + 1);
                setCurrPage(currPage + 1);
              }}
            >
              <NextPage disabled={currPage === pages! - 1} />
            </span>
          </div>
        </>
      ) : null}
    </>
  );
}

const TableContext = createContext<{
  itemsToShow: any[] | undefined;
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
        {itemsToShow?.map((i, index) => (
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
