import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
    const authContext = useContext(AuthContext);
    const location = useLocation();

    if (!authContext) {
        throw new Error("ProtectedRoute must be used within an AuthProvider");
    }

    const { isAuthenticated, isPublic } = authContext;

    // Las rutas de votación pueden ser accedidas por usuarios autenticados O por público con PIN
    const isVotingRoute = location.pathname.includes("/votar") || location.pathname === "/dashboard-votacion-categorias" || location.pathname === "/votos";

    if (isPublic && isVotingRoute) {
        return <Outlet />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
