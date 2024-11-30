import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Homepage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import ProfilePage from "../pages/ProfilePage";
import Signup from "../pages/Signup";
import PasswordSetup from "@/pages/PasswordSetup";
import LandingPage from "@/pages/LandingPage";

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
    },
    {
        path: '/signup',
        element: <PublicRoute><Signup /></PublicRoute>
    },
    {
        path: '/password-setup',
        element: <PublicRoute><PasswordSetup /></PublicRoute>
    },
    {
        path: '/feeds',
        element: <PrivateRoute><LandingPage/></PrivateRoute>
    }
]);

const AppRoutes: React.FC = () => {
    return <RouterProvider router={router}/>
}

export default AppRoutes;