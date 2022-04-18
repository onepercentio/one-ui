import { useMemo, useRef } from "react";

export default function useIntersection() {
  const { current: targetMap } = useRef<[HTMLOrSVGElement, () => void][]>([]);
  const { current: observer } = useRef(
    new IntersectionObserver((els) => {
      els.forEach((e, i) => {
        console.warn("Something", i, e);
        const result = targetMap.find((el) => el[0] === e.target as any);
        if (result && e.isIntersecting) {
          result[1]();
        }
      });
    })
  );
  return useMemo(() => {
    return {
      observe: (e: HTMLOrSVGElement, cb: () => void) => {
        targetMap.push([e, cb]);
        observer.observe(e as any);
      },
      unobserve: (e: HTMLOrSVGElement) => {
        observer.unobserve(e as any);
        targetMap.splice(
          targetMap.findIndex((el) => el[0] === e),
          1
        );
      },
    };
  }, []);
}
