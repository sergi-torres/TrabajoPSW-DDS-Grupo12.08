import { useState, useRef, useEffect } from "react";
import { Search, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/LogoSinTexto.png";

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

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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
                <button className="text-muted-foreground hover:text-foreground transition-colors relative">
                    <Bell size={20} strokeWidth={1.75} />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-destructive border-2 border-card rounded-full translate-x-1/2 -translate-y-1/4" />
                </button>

                <div className="relative" ref={menuRef}>
                    <div 
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--color-org)] to-[var(--color-part)] flex items-center justify-center text-white font-medium text-sm shadow-sm ring-2 ring-card group-hover:ring-muted transition-all">
                            {initials}
                        </div>
                        <ChevronDown 
                            size={16} 
                            strokeWidth={2} 
                            className={`text-muted-foreground group-hover:text-foreground transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} 
                        />
                    </div>

                    {/* Desplegable */}
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-3 w-64 bg-card border border-border rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                            <div className="px-4 py-3 border-b border-border mb-1">
                                <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-0.5">Sesión iniciada</p>
                                <p className="text-sm font-medium text-foreground truncate">{userName || "Usuario"}</p>
                            </div>
                            
                            <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
                                <User size={16} className="text-muted-foreground" />
                                Mi Perfil
                            </button>

                            <div className="h-px bg-border my-1" />
                            
                            <button 
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/5 transition-colors font-medium"
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
