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
import ResetPassword from "@/pages/ResetPassword";
import EmailVerification from "@/pages/EmailVerification";
import ForgotPassword from "@/pages/ForgotPassword";
import AppLayout from "./AppLayout";
import EventsPage from "@/pages/EventsPage";
import EventDetailsPage from "@/pages/EventDetailsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import CreatePost from "@/pages/CreatePost";
import ChatList from "@/pages/ChatList";
import NewChat from "@/pages/NewChat";
import SearchInterface from "@/pages/SearchInterface";
import PostDetailPage from "@/pages/PostDetailPage";


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
        path: '/profile/:userId',
        element: <PrivateRoute><ProfilePage isOwnProfile={true}/></PrivateRoute>
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
        element: <PrivateRoute><AppLayout><LandingPage setIsSidebarOpen={() => false}/></AppLayout></PrivateRoute>
    },
    {
        path: '/reset-password',
        element: <PublicRoute><ResetPassword /></PublicRoute>
    },
    {
        path: '/email-verification',
        element: <PublicRoute><EmailVerification/></PublicRoute>
    },
    {
        path: '/forgot-password',
        element: <PublicRoute><ForgotPassword/></PublicRoute>
    },
    {
        path: '/events',
        element: <PrivateRoute><EventsPage /></PrivateRoute>
    },
    {
        path: '/events/:id',
        element: <PrivateRoute><EventDetailsPage /></PrivateRoute>
    },
    {
        path: '/notifications',
        element: <PrivateRoute><NotificationsPage /></PrivateRoute>
    },
    {
        path: '/create-post',
        element: <PrivateRoute><CreatePost /></PrivateRoute>
    },
    {
        path: '/chats',
        element: <PrivateRoute><ChatList /></PrivateRoute>
    },
    {
        path: '/new-chat',
        element: <PrivateRoute><NewChat /></PrivateRoute>
    },
    {
        path: '/search',
        element: <PrivateRoute><SearchInterface /></PrivateRoute>
    },
    {
        path: '/post/:postId',
        element: <PrivateRoute><PostDetailPage/></PrivateRoute>
    }
]);

const AppRoutes: React.FC = () => {
    return <RouterProvider router={router}/>
}

export default AppRoutes;