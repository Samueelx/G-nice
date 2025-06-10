import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { RootState } from "../store/store";
import { useWebSocketContext } from "../context/webSocketContext";
import MobileFooterNav from "@/components/common/MobileFooterNav";

interface Props {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
    const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
    const user = useAppSelector((state: RootState) => state.auth.user);
    const location = useLocation();
    const { isConnected, reconnect } = useWebSocketContext();

    // Ensure WebSocket connection on any private route
    useEffect(() => {
        if (isAuthenticated && user && !isConnected) {
            console.log('🔄 Private route accessed, ensuring WebSocket connection...');
            reconnect();
        }
    }, [isAuthenticated, user, isConnected, reconnect, location.pathname]);

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    return (
        <div className="min-h-screen pb-16">
            <main>
                {children}
            </main>
            <MobileFooterNav />
        </div>
    );
};

export default PrivateRoute;
