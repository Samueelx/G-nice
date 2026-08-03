import React, { Suspense, lazy } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import PublicRoute from "./PublicRoute";
import Homepage from "../pages/Homepage";
import LoginPage from "../pages/LoginPage";
import PrivateRoute from "./PrivateRoute";
import ProfilePage from "../pages/ProfilePage";
import Signup from "../pages/Signup";
import OtpVerification from "@/pages/OtpVerification";
import LandingPage from "@/pages/LandingPage";
import ResetPassword from "@/pages/ResetPassword";
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
import EditProfilePage from "@/pages/EditProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import ChangePasswordPage from "@/pages/ChangePasswordPage";
import AdminRoute from "./AdminRoute";

const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminJokesPage = lazy(() => import("@/pages/admin/AdminJokesPage"));
const AdminEventsPage = lazy(() => import("@/pages/admin/AdminEventsPage"));

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
        path: '/signup',
        element: <PublicRoute><Signup /></PublicRoute>
    },
    {
        path: '/verify-otp',
        element: <PublicRoute><OtpVerification /></PublicRoute>
    },
    {
        path: '/reset-password',
        element: <PublicRoute><ResetPassword /></PublicRoute>
    },
    {
        path: '/forgot-password',
        element: <PublicRoute><ForgotPassword/></PublicRoute>
    },
    {
        path: '/feeds',
        element: <PrivateRoute><AppLayout><LandingPage setIsSidebarOpen={() => false}/></AppLayout></PrivateRoute>
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
    },
    {
        // Own profile - no username in URL, uses token
        path: '/profile',
        element: <PrivateRoute><ProfilePage isOwnProfile={true}/></PrivateRoute>
    },
    {
        // Edit profile
        path: '/profile/edit',
        element: <PrivateRoute><EditProfilePage/></PrivateRoute>
    },
    {
        // Other users' profiles - has username in URL
        path: '/profile/:username',
        element: <PrivateRoute><ProfilePage isOwnProfile={false}/></PrivateRoute>
    },
    {
        path: '/settings',
        element: <PrivateRoute><SettingsPage/></PrivateRoute>
    },
    {
        path: '/settings/change-password',
        element: <PrivateRoute><ChangePasswordPage /></PrivateRoute>
    },
    {
        path: '/admin',
        element: (
            <AdminRoute>
                <Suspense fallback={<div className="flex h-screen items-center justify-center bg-gray-50 text-gray-500">Loading Admin Dashboard...</div>}>
                    <AdminLayout />
                </Suspense>
            </AdminRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="jokes" replace />
            },
            {
                path: 'jokes',
                element: <AdminJokesPage />
            },
            {
                path: 'events',
                element: <AdminEventsPage />
            }
        ]
    }
]);

const AppRoutes: React.FC = () => {
    return <RouterProvider router={router}/>
}

export default AppRoutes;