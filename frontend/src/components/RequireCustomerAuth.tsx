import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCustomerAuth } from "../context/CustomerAuthContext";

export default function RequireCustomerAuth() {
    const { isAuthenticated, isLoading } = useCustomerAuth();
    const location = useLocation();

    if (isLoading) return null;
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return <Outlet />;
}
