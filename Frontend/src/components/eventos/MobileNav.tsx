import { Home, Bell, User, HelpCircle } from "lucide-react";
import { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { LogoutConfirmModal } from "../layout/LogoutConfirmModal";
import FAQModal from "../layout/FAQModal";

export function MobileNav() {
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const authContext = useContext(AuthContext);
  const userName = authContext?.userName || "";

  const initials = userName
    ? userName.split("@")[0].substring(0, 2).toUpperCase()
    : "US";

  const handleNavigation = (path: string) => {
    window.location.href = path;
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.clear();
      window.location.href = "/login";
    }, 300);
  };

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-white border-t border-gray-200 flex items-center justify-around px-4 pb-1 z-50 shadow-lg">
        {/* Eventos */}
        <button
          onClick={() => handleNavigation("/eventos")}
          className="flex flex-col items-center gap-1 text-blue-600 transition-colors"
        >
          <Home size={22} strokeWidth={2} />
          <span className="text-[11px] font-medium mt-0.5">Eventos</span>
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

        {/* Ayuda */}
        <button
          onClick={() => setShowFAQ(true)}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <HelpCircle size={22} strokeWidth={1.75} />
          <span className="text-[11px] font-medium mt-0.5">Ayuda</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => setShowProfileSheet(true)}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <User size={22} strokeWidth={1.75} />
          <span className="text-[11px] font-medium mt-0.5">Perfil</span>
        </button>
      </nav>

      {/* Espaciador para que el contenido no quede debajo de la navbar */}
      <div className="lg:hidden h-[68px]" />

      {/* Profile Bottom Sheet */}
      {showProfileSheet && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-[55]"
            onClick={() => setShowProfileSheet(false)}
          />
          <div className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-2xl shadow-xl">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            <div className="px-6 pt-4 pb-8">
              {/* User info */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-base">{userName || "Usuario"}</p>
                  <p className="text-sm text-gray-500">Cuenta personal</p>
                </div>
              </div>

              {/* Logout button */}
              <button
                onClick={() => {
                  setShowProfileSheet(false);
                  setShowLogoutModal(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </>
      )}

      {/* FAQ Modal */}
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />

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
