import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { RootState } from "../store/store";
import MobileFooterNav from "@/components/common/MobileFooterNav";
import { WebSocketProvider } from "@/context/WebSocketProvider"; // Adjust import path as needed

interface Props {
    children: React.ReactNode;
}

const PrivateRoute: React.FC<Props> = ({ children }) => {
    const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
    const location = useLocation();
    
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }
    
    return (
        <WebSocketProvider>
            <div className="min-h-screen pb-16"> {/* Add padding bottom to prevent footer overlap */}
                <main>
                    {children}
                </main>
                <MobileFooterNav />
            </div>
        </WebSocketProvider>
    );
};

export default PrivateRoute;