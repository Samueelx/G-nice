import React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../hooks/hooks";
import { RootState } from "../store/store";

interface Props {
    children: React.ReactNode;
}

const PrivateRoute:React.FC<Props> = ({children}) => {
    const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);

    return isAuthenticated ? <>{children}</>: <Navigate to="/login" />
}

export default PrivateRoute;