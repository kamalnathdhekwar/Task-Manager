import { createBrowserRouter } from "react-router-dom";
import Main from "../Layout/MainLayout/Main";
import Login from "../Pages/Login/Login";
import Signup from "../Pages/Login/Signup";
import Home from "../Pages/Home/Home";
import ProtectedRoute from "./ProtectedRoute";
import AddTask from "../Pages/AddTask/AddTask";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Main />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/addTask",
        element: <AddTask />,
      },
    ],
  },
]);

export default router;
