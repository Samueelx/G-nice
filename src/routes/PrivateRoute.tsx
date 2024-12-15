import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { RootState } from "../store/store";

interface Props {
    children: React.ReactNode;
}

const PrivateRoute:React.FC<Props> = ({children}) => {
    const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
    const location = useLocation();

    return isAuthenticated ? <>{children}</>: <Navigate to="/login" state={{from: location}} />
}

export default PrivateRoute;