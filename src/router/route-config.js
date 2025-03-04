import EditorPage from "../pages/EditorPage";
import HomePage from "../pages/HomePage";
import EditorLayout from "./editor-layout";
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
                element: <EditorLayout />,
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