import { useEffect } from "react";

export default function useIsMounting(tag: string) {
    useEffect(() => {
        console.log(tag + " is mounting")
    }, []);
}