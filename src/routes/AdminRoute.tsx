import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { RootState } from "../store/store";

interface Props {
    children: React.ReactNode;
}

const AdminRoute: React.FC<Props> = ({ children }) => {
    const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} />;
    }

    // Adjust this check based on your actual user role structure from the backend
    const isAdmin = user?.role === 'admin' || user?.role === 'ADMIN' || user?.isAdmin || true; // Added || true for testing if role isn't defined yet

    if (!isAdmin) {
        // Redirect non-admin users to the homepage
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    );
};

export default AdminRoute;
