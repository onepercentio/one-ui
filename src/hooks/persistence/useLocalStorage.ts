import { useEffect, useState } from "react";
const DUD = typeof "";
type AvailablePrimitives = typeof DUD;
const toString = (val: any) => {
  switch (typeof val) {
    case "boolean":
      return !val ? "0" : "1";
    case "string":
      return val;
    case "object":
      return JSON.stringify(val);
    default:
      throw new Error("Doesn't know how to handle type " + typeof val);
  }
};
const fromString = (type: AvailablePrimitives, value: string) => {
  switch (type) {
    case "boolean":
      return value === "1";
    case "string":
      return value;
    case "object":
      return JSON.parse(value);
    default:
      throw new Error("Doesn't know how to handle type " + type);
  }
};
export default function useLocalStorage<T extends any>(
  id: string,
  defaultValue: Exclude<T, undefined>
) {
  const [val, setVal] = useState<T>(() => {
    const persistedValue = localStorage.getItem(id);
    if (persistedValue === null) return defaultValue as T;
    return fromString(typeof defaultValue, persistedValue) as T;
  });
  useEffect(() => {
    localStorage.setItem(id, toString(val));
  }, [val]);
  return [val, setVal] as const;
}
