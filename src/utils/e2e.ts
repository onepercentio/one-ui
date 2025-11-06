import Module from "module";

function toSrcPath(str: string) {
  const indexOfSrc = str.indexOf("src");
  const modName = indexOfSrc === -1 ? str : str.slice(indexOfSrc);
  return modName.replace("appclientecmascript", "");
}

/** Try to make the string follow the snake case pattern (e.g. "SOME_ELEMENT") */
type IDENTIFIER = string;

type PossibleT = (
  | IDENTIFIER
  | readonly [id: IDENTIFIER, func: <X>(n: X) => string]
)[];

type T<IDS extends PossibleT> = {
  [I in IDS[number] extends string
    ? IDS[number]
    : IDS[number][0]]: I extends IDS[number] ? string : (id: any) => string;
};

export function combineTestIds(...t: ReturnType<typeof testIDFactory>[]) {
  return t.reduce((acc, i) => ({ ...acc, i }), {});
}

/**
 * Creates an data-testid map generator instance based on the module name or arbitrary id
 * @returns A function to set the IDs that this created instance will provide
 */
export function testIDFactory(moduleOrId: Pick<Module, "id"> | string) {
  const moduleId = typeof moduleOrId === "string" ? moduleOrId : moduleOrId.id;
  return <const IDS extends PossibleT>(idsArr: IDS) =>
    [idsArr].reduce(
      (acc, ids) => ({
        ...acc,
        ...ids.reduce(
          (map, id) => ({
            ...map,
            [typeof id === "string" ? id : id[0]]:
              typeof id === "string"
                ? `${toSrcPath(
                    moduleId.toLowerCase().replace(/[^a-z]/g, "")
                  )}-${id}`
                : (i: any) =>
                    `${toSrcPath(
                      moduleId.toLowerCase().replace(/[^a-z]/g, "")
                    )}-${id[1](i)}`,
          }),
          {} as T<IDS>
        ),
      }),
      {} as T<IDS>
    );
}
