import EditorPage from "../pages/EditorPage";
import HomePage from "../pages/HomePage";
import AppLayout from "./app-layout";
import EditorLayout from "./app-layout";
import GlobalErrorBoundary from "./global-error-boundary";

export const routeConfig = [
    {
        path: "/",
        errorElement: <GlobalErrorBoundary />,
        children: [
            {
                path: "",
                element: <HomePage />
            },
            {
                path: "editor",
                element: <AppLayout />,
                children: [
                    {
                        path: ":roomId",
                        element: <EditorPage />
                    }
                ]
            }
        ]
    }
]