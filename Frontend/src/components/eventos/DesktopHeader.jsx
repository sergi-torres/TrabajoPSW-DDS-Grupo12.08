import { Search, Bell, ChevronDown } from "lucide-react";
import logo from "../../assets/LogoSinTexto.png";

/**
 * DesktopHeader — Barra superior fija para escritorio.
 * @param {Object} props
 * @param {string} props.searchQuery - Texto actual del buscador
 * @param {Function} props.onSearchChange - Callback cuando cambia el texto
 */
export function DesktopHeader({ searchQuery = "", onSearchChange }) {
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

                <div className="flex items-center gap-2 cursor-pointer group">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[var(--color-org)] to-[var(--color-part)] flex items-center justify-center text-white font-medium text-sm shadow-sm ring-2 ring-card group-hover:ring-muted transition-all">
                        US
                    </div>
                    <ChevronDown size={16} strokeWidth={2} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
            </div>
        </header>
    );
}
