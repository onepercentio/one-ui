import { Ref, RefObject, useEffect, useRef, useState } from "react";

/**
 * This hook receives a base width of an element and returns how much items fit **vertically** inside the referenced html element
 * 
 * @param baseWidth The base width of each element
 */
export default function useElementFit(baseWidth: number): {
    /** The amount of items that are able to fit in the available width */
    itemsToShow: number,

    /** The ref to be sent to the element that will receive the items */
    ref: Ref<HTMLDivElement>
} {
    const ref = useRef<HTMLDivElement>(null);
    function calculateDimension() {
        if ((window as any).PRERENDER) return 4;

        const width = ref.current?.clientWidth || window.visualViewport.width;
        return Math.floor(width / baseWidth) || 1;
    }
    const [itemsToShow, setItemsToShow] = useState((window as any).PRERENDER ? 4 : 1);
    useEffect(() => {
        setItemsToShow(calculateDimension());
        function onResize() {
            setItemsToShow(calculateDimension());
        }
        window.addEventListener("resize", onResize);
        return () => {
            window.removeEventListener("resize", onResize);
        };
    }, []);

    return {
        itemsToShow,
        ref
    }
}