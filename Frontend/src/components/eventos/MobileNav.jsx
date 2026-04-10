import { Home, Search, Bell, User } from "lucide-react";

/**
 * MobileNav — Barra de navegación inferior para móvil.
 */
export function MobileNav() {
    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-card border-t border-border flex items-center justify-between px-8 pb-1 z-50">
            <button className="flex flex-col items-center gap-1 text-[var(--color-org)]">
                <Home size={22} strokeWidth={2} />
                <span className="text-[11px] font-medium mt-0.5">Eventos</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <Search size={22} strokeWidth={1.75} />
                <span className="text-[11px] font-medium mt-0.5">Explorar</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors relative">
                <Bell size={22} strokeWidth={1.75} />
                <span className="text-[11px] font-medium mt-0.5">Avisos</span>
                <span className="absolute top-0 right-1 w-1.5 h-1.5 bg-destructive rounded-full" />
            </button>
            <button className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                <User size={22} strokeWidth={1.75} />
                <span className="text-[11px] font-medium mt-0.5">Perfil</span>
            </button>
        </nav>
    );
}
