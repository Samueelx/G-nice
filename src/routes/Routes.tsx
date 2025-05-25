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
import TopicPage from "@/pages/TopicPage";

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
        path: '/profile',//6
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
        path: '/feeds',//5
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
        path: '/events',//=> Upgaded
        element: <PrivateRoute><EventsPage /></PrivateRoute>
    },
    {
        path: '/events/:id',//upgraded
        element: <PrivateRoute><EventDetailsPage /></PrivateRoute>
    },
    {
        path: '/notifications', //=>Upgraded
        element: <PrivateRoute><NotificationsPage /></PrivateRoute>
    },
    {
        path: '/create-post',//2
        element: <PrivateRoute><CreatePost /></PrivateRoute>
    },
    {
        path: '/chats',
        element: <PrivateRoute><ChatList /></PrivateRoute>
    },
    {
        path: '/new-chat',//1.
        element: <PrivateRoute><NewChat /></PrivateRoute>
    },
    {
        path: '/search', //=> Upgraded
        element: <PrivateRoute><SearchInterface /></PrivateRoute>
    },
    // {
    //     path: '/users/:id',
    //     element: <PrivateRoute><UserProfile /></PrivateRoute>
    //   },
      {
        path: '/topics/:id',//2
        element: <PrivateRoute><TopicPage /></PrivateRoute>
      },
    //   {
    //     path: '/memes/:id',
    //     element: <PrivateRoute><MemePage /></PrivateRoute>
    //   }
      
]);

const AppRoutes: React.FC = () => {
    return <RouterProvider router={router}/>
}

export default AppRoutes;