import { useEffect, useState } from "react"

/**
 * This hook adds a prop that you can toggle and returns to initial 
 * state after a defined time (usefull for notification)
 */
export default function useRebound<T extends any>(initialValue: T, timeoutSec: number = 1) {
    const [state, setState] = useState<T>(initialValue)

    useEffect(() => {
        if (state !== initialValue) {
            const timeout = setTimeout(() => {
                setState(initialValue)
            }, timeoutSec * 1000);

            return () => clearTimeout(timeout);
        }
    }, [state]);
    return {
        current: state,
        setState
    }
}