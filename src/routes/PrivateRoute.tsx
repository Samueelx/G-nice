import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { RootState } from "../store/store";
import MobileFooterNav from "@/components/common/MobileFooterNav";
import { WebSocketProvider } from "@/context/WebSocketProvider"; // Adjust import path as needed
import { useWebSocketPostsHandler } from "@/features/posts/useWebSocketPostsHandler";

interface Props {
    children: React.ReactNode;
}

// Inner component that uses the WebSocket context
const AuthenticatedContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useWebSocketPostsHandler(); // ✅ Now inside WebSocketProvider
    
    return (
        <div className="min-h-screen pb-16">
            <main>
                {children}
            </main>
            <MobileFooterNav />
        </div>
    );
};

const PrivateRoute: React.FC<Props> = ({ children }) => {
    const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
    const location = useLocation();
   
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }
   
    return (
        <WebSocketProvider>
            <AuthenticatedContent>
                {children}
            </AuthenticatedContent>
        </WebSocketProvider>
    );
};

export default PrivateRoute;