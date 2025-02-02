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

const userProfile = {
    username: "knightwing",
    handle: "knightwing.19",
    avatar: "https://plus.unsplash.com/premium_photo-1682124752476-40db22034a58?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    bio: "Keep moving forward",
    location: "Gotham City",
    occupation: "Software Developer",
    joinDate: "January 2024",
    followers: 1234,
    following: 567
  };
  
  const userPosts = [
    {
      id: "1",
      content: "Just another day in the city...",
      timestamp: "2 hours ago",
      likes: 42,
      comments: 7
    },
    // ... more posts
  ];
  
  const userComments = [
    {
      id: "1",
      content: "Great post!",
      postTitle: "The Future of Web Development",
      timestamp: "1 hour ago"
    },
    // ... more comments
  ];

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
        element: <PrivateRoute><ProfilePage user={userProfile} posts={userPosts} comments={userComments} isOwnProfile={true}/></PrivateRoute>
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
        element: <PrivateRoute><AppLayout><LandingPage/></AppLayout></PrivateRoute>
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
    }
]);

const AppRoutes: React.FC = () => {
    return <RouterProvider router={router}/>
}

export default AppRoutes;