import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import { AlertTriangle, Home, LogIn } from "lucide-react";
import { AuthContext } from "../context/AuthContext";

const NotFound = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext)!;

    useEffect(() => {
        console.error("404 Error: Ruta no encontrada:", location.pathname);
    }, [location.pathname]);

    const handleRedirect = () => {
        navigate(isAuthenticated ? "/eventos" : "/login", { replace: true });
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
            <div className="text-center bg-card p-8 sm:p-10 rounded-3xl shadow-votify-base max-w-md w-full border border-border">
                <div className="flex justify-center mb-6">
                    <div className="p-4 bg-error-bg rounded-full">
                        <AlertTriangle className="w-12 h-12 text-error" strokeWidth={1.5} />
                    </div>
                </div>
                <h1 className="mb-2 text-4xl font-heading font-extrabold text-foreground tracking-tight">404</h1>
                <p className="mb-8 text-muted-foreground font-body">
                    Parece que te has perdido. La página que buscas no existe o no tienes acceso.
                </p>
                <button
                    onClick={handleRedirect}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl font-heading font-bold hover:bg-primary/90 transition-all active:scale-[0.98]"
                >
                    {isAuthenticated ? (
                        <><Home className="w-5 h-5" strokeWidth={2.5} /> Volver a Mis Eventos</>
                    ) : (
                        <><LogIn className="w-5 h-5" strokeWidth={2.5} /> Ir al Login</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NotFound;
