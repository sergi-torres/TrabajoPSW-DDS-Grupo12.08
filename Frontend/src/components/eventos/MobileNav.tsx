import { Home, Search, Bell, User, LogOut, Settings, HelpCircle } from "lucide-react";
import { useState } from "react";
import { LogoutConfirmModal } from "../layout/LogoutConfirmModal";

/**
 * MobileNav — Barra de navegación inferior para móvil.
 */
export function MobileNav() {
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    setIsLoading(true);
    // Simulamos un pequeño delay para que se vea la animación
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/login";
    }, 300);
  };

  const handleLogoutClick = () => {
    setShowMenu(false);
    setShowLogoutModal(true);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-gray-200 flex items-center justify-between px-8 pb-1 z-50 shadow-lg">
        {/* Eventos */}
        <button
          onClick={() => handleNavigation("/eventos")}
          className="flex flex-col items-center gap-1 text-purple-600 transition-colors"
        >
          <Home size={22} strokeWidth={2} />
          <span className="text-[11px] font-medium mt-0.5">Eventos</span>
        </button>

        {/* Explorar */}
        <button
          onClick={() => {/*handleNavigation("/explorar")*/}}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Search size={22} strokeWidth={1.75} />
          <span className="text-[11px] font-medium mt-0.5">Explorar</span>
        </button>

        {/* Avisos */}
        <button
          onClick={() => handleNavigation("/avisos")}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors relative"
        >
          <Bell size={22} strokeWidth={1.75} />
          <span className="text-[11px] font-medium mt-0.5">Avisos</span>
          <span className="absolute top-0 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        {/* Perfil con menú desplegable */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <User size={22} strokeWidth={1.75} />
            <span className="text-[11px] font-medium mt-0.5">Perfil</span>
          </button>

          {/* Menú desplegable */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in slide-in-from-bottom-2 fade-in duration-200">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNavigation("/perfil");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User size={16} />
                  <span>Mi Perfil</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNavigation("/configuracion");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={16} />
                  <span>Configuración</span>
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleNavigation("/ayuda");
                  }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <HelpCircle size={16} />
                  <span>Ayuda</span>
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Espaciador para que el contenido no quede debajo de la navbar */}
      <div className="lg:hidden h-[68px]" />

      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={isLoading}
      />
    </>
  );
}
