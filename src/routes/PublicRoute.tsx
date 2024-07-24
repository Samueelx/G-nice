import React from "react";
import { RootState } from "../store/store";
import { useAppSelector } from "../hooks/hooks";

interface Props {
    children: React.ReactNode;
}

const PublicRoute: React.FC<Props> = ({children}) => {
    const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);

    return !isAuthenticated ? <>{children}</> : <>{children}</>; //Adjust as needed.
}

export default PublicRoute;