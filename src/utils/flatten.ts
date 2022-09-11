import { FieldPath } from "../types";

export function flatten<T extends object>(obj: T): { [k in FieldPath<T>]: string } {
    return Object.assign(
        {},
        ...(function _flatten(o, prevKey: string = ""): any {
            return [].concat(
                ...Object.keys(o).map((_k) => {
                    const k = _k as keyof typeof o;
                    return typeof o[k] === "object"
                        ? _flatten(o[k] as any, prevKey ? `${prevKey}.${k as string}` : (k as string))
                        : { [prevKey ? `${prevKey}.${k as string}` : k]: o[k] };
                })
            );
        })(obj)
    );
}