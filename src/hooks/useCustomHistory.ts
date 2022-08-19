import { useHistory, useLocation } from "react-router-dom"
import { CustomState } from "../context/CustomBrowserRouter";

export default function useCustomHistory() {
    const customHistory = useHistory();
    const { state } = useLocation<CustomState | undefined>();
    return {
        ...customHistory,
        goBackWithFallback(fallbackRoute: string) {
            if (state?.internalNavigation) customHistory.goBack();
            else customHistory.push(fallbackRoute);
        }
    }
}