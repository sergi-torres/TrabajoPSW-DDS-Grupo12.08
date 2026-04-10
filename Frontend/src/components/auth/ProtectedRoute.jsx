import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ProtectedRoute = () => {
    const { isAuthenticated } = useAuth();

    // Si no está autenticado, lo redirige a la página de login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Si está autenticado, renderiza las rutas hijas
    return <Outlet />;
};

export default ProtectedRoute;
