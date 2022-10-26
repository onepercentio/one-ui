import { useEffect } from "react";

export default function useIsMounting(id: string) {
    useEffect(() => {
        console.log(id + " is mounting")
    }, []);
}