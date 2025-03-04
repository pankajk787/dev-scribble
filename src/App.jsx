import { RouterProvider } from "react-router-dom";
import router from "./router/router";
import { Toaster } from "react-hot-toast";
import "./App.css"
function App() {
  return (
    <>
      <RouterProvider router={router}/>
      <Toaster position="top-right"/>
    </>
  );
}

export default App;
