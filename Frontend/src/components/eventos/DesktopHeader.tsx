import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/LogoSinTexto.png";
import { useNavigate } from "react-router-dom";
    
/**
 * DesktopHeader — Barra superior fija para escritorio con menú de usuario.
 */

interface DesktopHeaderProps {
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export function DesktopHeader({ searchQuery = "", onSearchChange }: DesktopHeaderProps) {
    const { userName, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();


useEffect(() => {
  // 1. Cargar contador de notificaciones
  const loadUnreadCount = () => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const notifications = JSON.parse(stored);
      const unread = notifications.filter((n: any) => !n.read).length;
      setUnreadCount(unread);
    }
  };
  loadUnreadCount();

  // 2. Escuchar cambios en localStorage
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "notifications") {
      loadUnreadCount();
    }
  };
  window.addEventListener("storage", handleStorageChange);

  // 3. Cerrar menú al hacer clic fuera
  const handleClickOutside = (event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);

  // Cleanup
  return () => {
    window.removeEventListener("storage", handleStorageChange);
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

    const initials = userName 
        ? userName.split("@")[0].substring(0, 2).toUpperCase() 
        : "US";

    return (
        <header className="hidden lg:flex fixed top-0 w-full h-[72px] bg-card/95 backdrop-blur-md z-50 border-b border-border items-center px-8 justify-between transition-all">
            {/* Logo */}
            <div className="flex items-center gap-2.5 text-[1.375rem] font-bold font-heading tracking-tight text-foreground w-64 cursor-pointer">
                <img src={logo} alt="Votify" className="w-8 h-8 object-contain" />
                Votify
            </div>

            {/* Buscador */}
            <div className="flex-1 max-w-[480px] relative group">
                <Search size={18} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--color-org)] transition-colors" />
                <input
                    type="text"
                    placeholder="Buscar evento..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full bg-muted hover:bg-accent focus:bg-card border border-transparent focus:border-[var(--color-org)]/30 rounded-full h-11 pl-11 pr-4 outline-none transition-all text-sm font-body text-foreground placeholder:text-muted-foreground focus:shadow-[0_0_0_4px_rgba(59,130,246,0.05)]"
                />
            </div>

            {/* Perfil + Notificaciones */}
<div className="flex items-center justify-end gap-6 w-64">
  {/* Notificaciones - Ahora navega a /avisos */}
  <button 
    onClick={() => navigate("/avisos")}
    className="text-muted-foreground hover:text-foreground transition-colors relative"
  >
    <Bell size={20} strokeWidth={1.75} />
    {/* Indicador de notificaciones no leídas */}
    {unreadCount > 0 && (
      <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 border-2 border-white rounded-full translate-x-1/2 -translate-y-1/4" />
    )}
  </button>

  {/* Menú de perfil */}
  <div className="relative" ref={menuRef}>
    <div 
      className="flex items-center gap-2 cursor-pointer group"
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-purple-400 flex items-center justify-center text-white font-medium text-sm shadow-sm ring-2 ring-white group-hover:ring-gray-200 transition-all">
        {initials}
      </div>
      <ChevronDown 
        size={16} 
        strokeWidth={2} 
        className={`text-gray-500 group-hover:text-gray-700 transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
      />
    </div>

    {/* Desplegable */}
    {isMenuOpen && (
      <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
        <div className="px-4 py-3 border-b border-gray-100 mb-1">
          <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-0.5">Sesión iniciada</p>
          <p className="text-sm font-medium text-gray-900 truncate">{userName || "Usuario"}</p>
        </div>
        
        <button 
          onClick={() => {
            setIsMenuOpen(false);
            navigate("/perfil");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <User size={16} className="text-gray-500" />
          Mi Perfil
        </button>

        <button 
          onClick={() => {
            setIsMenuOpen(false);
            navigate("/avisos");
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Bell size={16} className="text-gray-500" />
          Avisos
          {unreadCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>

        <div className="h-px bg-gray-100 my-1" />
        
        <button 
          onClick={() => {
            setIsMenuOpen(false);
            logout();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    )}
  </div>
</div>
        </header>
    );
}
