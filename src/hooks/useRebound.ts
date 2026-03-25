import { useEffect, useState } from "react"

/**
 * This hook adds a prop that you can toggle and returns to initial 
 * state after a defined time (usefull for notification)
 */
/**
 * This hook manages a value that automatically resets to its starting point after a set time.
 * It's useful for showing temporary messages like notifications that disappear on their own.
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