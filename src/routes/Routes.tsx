import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Homepage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import ProfilePage from "../pages/ProfilePage";

const router = createBrowserRouter([
    {
        path: '/',
        element: <PublicRoute><Homepage /></PublicRoute>
    },
    {
        path: '/login',
        element: <PublicRoute><LoginPage /></PublicRoute>
    },
    {
        path: '/profile',
        element: <PrivateRoute><ProfilePage /></PrivateRoute>
    }
]);

const AppRoutes: React.FC = () => {
    return <RouterProvider router={router}/>
}

export default AppRoutes;