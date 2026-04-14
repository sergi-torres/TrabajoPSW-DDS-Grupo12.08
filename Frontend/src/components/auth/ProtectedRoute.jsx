import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
    const { isAuthenticated, isPublic } = useContext(AuthContext);
    const location = useLocation();

    // Las rutas de votación pueden ser accedidas por usuarios autenticados O por público con PIN
    const isVotingRoute = location.pathname === "/dashboard-votacion-categorias" || location.pathname === "/votos";

    if (isPublic && isVotingRoute) {
        return <Outlet />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
