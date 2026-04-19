import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Info, FolderOpen, Trophy, Settings, ClipboardList, User, LogOut, ChevronUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "../../hooks/useAuth";
import logo from "../../assets/LogoSinTexto.png";

/**
 * Utility for merging tailwind classes safely.
 */
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

/**
 * EventSidebar — Sidebar responsiva para navegación de eventos con color del rol.
 */
// eslint-disable-next-line no-unused-vars
export function EventSidebar({ userRole, color = "var(--color-org)" }) {
    const { id: eventId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { userName, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // Dynamic role styles mapping
    const roleStyles = {
        "var(--color-org)": { text: "text-blue-600", bg: "bg-blue-50" },
        "#ea580c": { text: "text-orange-600", bg: "bg-orange-50" },
        "#9333ea": { text: "text-purple-600", bg: "bg-purple-50" },
        "#059669": { text: "text-emerald-600", bg: "bg-emerald-50" },
        "#8B5CF6": { text: "text-purple-600", bg: "bg-purple-50" },
        "#F97316": { text: "text-orange-600", bg: "bg-orange-50" },
        "#3B82F6": { text: "text-blue-600", bg: "bg-blue-50" },
        "#10B981": { text: "text-emerald-600", bg: "bg-emerald-50" }
    };

    const activeStyle = roleStyles[color] || roleStyles["var(--color-org)"];

    // Cerrar menú al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initials = userName 
        ? userName.split("@")[0].substring(0, 2).toUpperCase() 
        : "US";

    // Secciones comunes
    const commonLinks = [
        { label: "General", path: `/eventos/${eventId}`, icon: Info },
        { label: "Proyectos", path: `/eventos/${eventId}/proyectos`, icon: FolderOpen },
        { label: "Ranking", path: `/eventos/${eventId}/ranking`, icon: Trophy },
    ];

    // Secciones por rol
    const roleLinks = [];
    const normalizedRole = userRole?.toLowerCase();
    
    if (normalizedRole === "organizador") {
        roleLinks.push({ label: "Ajustes", path: `/eventos/${eventId}/settings`, icon: Settings });
    } else if (normalizedRole === "jurado") {
        roleLinks.push({ label: "Evaluaciones", path: `/eventos/${eventId}/evaluations`, icon: ClipboardList });
    } else if (normalizedRole === "participante") {
        roleLinks.push({ label: "Mi Proyecto", path: `/eventos/${eventId}/my-project`, icon: User });
    }

    const allLinks = [...commonLinks, ...roleLinks];

    const NavItem = ({ link }) => {
        const isActive = location.pathname === link.path;
        const Icon = link.icon;

        return (
            <Link
                to={link.path}
                className={cn(
                    "flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200",
                    isActive 
                        ? cn(activeStyle.bg, activeStyle.text, "font-semibold shadow-sm")
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
            >
                <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2} 
                    color={isActive ? color : "currentColor"}
                />
                <span className="text-[11px] lg:text-sm font-medium">{link.label}</span>
            </Link>
        );
    };

    return (
        <>
            {/* Desktop Sidebar (lg and up) */}
            <aside className={cn(
                "hidden lg:flex flex-col w-64 fixed left-4 top-6 bottom-6 z-40 bg-white shadow-xl rounded-2xl transition-all duration-300",
            )}>
                {/* Logo Section */}
                <div 
                    className="flex items-center gap-3 text-[1.25rem] font-bold font-heading tracking-tight px-4 py-8 mb-4 cursor-pointer group"
                    onClick={() => navigate("/eventos")}
                >
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                        <img src={logo} alt="Votify" className="w-7 h-7 object-contain" />
                    </div>
                    <span className="text-slate-900">Votify</span>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {allLinks.map((link) => (
                        <NavItem key={link.path} link={link} />
                    ))}
                </nav>

                {/* User Profile Section (Bottom) */}
                <div className="relative mt-auto border-t border-slate-100 pt-4 px-2" ref={menuRef}>
                    <div 
                        className="flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-xl transition-all"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium text-sm shadow-sm ring-2 ring-slate-50 group-hover:ring-slate-100 transition-all flex-shrink-0">
                                {initials}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <p className="text-sm font-bold truncate text-slate-900">{userName || "Usuario"}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{userRole || "Invitado"}</p>
                            </div>
                        </div>
                        <ChevronUp 
                            size={16} 
                            strokeWidth={2.5} 
                            className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isMenuOpen ? "rotate-180" : ""}`} 
                        />
                    </div>

                    {/* Pop-up Menu */}
                    {isMenuOpen && (
                        <div className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200 text-slate-700">
                            <button 
                                onClick={() => navigate("/perfil")}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
                            >
                                <User size={16} className="text-slate-400" />
                                Mi Perfil
                            </button>
                            <div className="h-px bg-slate-100 my-1 mx-2" />
                            <button 
                                onClick={() => {
                                    setIsMenuOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-semibold"
                            >
                                <LogOut size={16} />
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Navigation (under lg) - Always visible if desktop is hidden */}
            <nav className={cn(
                "flex lg:hidden fixed bottom-4 left-4 right-4 h-[68px] bg-white items-center justify-between px-6 z-50 rounded-2xl shadow-xl",
            )}>
                {allLinks.map((link) => (
                    <NavItem key={link.path} link={link} />
                ))}
            </nav>
        </>
    );
}
