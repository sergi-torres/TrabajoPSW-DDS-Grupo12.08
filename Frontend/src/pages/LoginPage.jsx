import { MobileLayout } from "../components/auth/MobileLayout";
import { DesktopLayout } from "../components/auth/DesktopLayout";

/**
 * LoginPage.jsx
 * 
 * Punto de entrada principal (Ruta `/login`).
 * Es un contenedor inteligente que, basándose en el ancho de la pantalla,
 * decide si montar el layout del móvil (`<MobileLayout />`) 
 * o el layout de escritorio (`<DesktopLayout />`).
 */
export default function LoginPage() {
    return (
        <div className="min-h-screen bg-app font-body text-primary">
            {/* Vista Móvil */}
            <div className="lg:hidden">
                <MobileLayout />
            </div>

            {/* Vista Escritorio */}
            <div className="hidden lg:block">
                <DesktopLayout />
            </div>
        </div>
    );
}
