import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { Info, FolderOpen, Trophy, Settings, ClipboardList, User, FileText, LogOut, ChevronUp, ChevronLeft, ChevronRight, Vote, Timer, Lightbulb, LucideIcon, Sparkles, List, HelpCircle} from "lucide-react";
import { useState, useRef, useEffect, useContext } from "react";
import { useAuth } from "../../hooks/useAuth";
import { EventContext } from "../../context/EventContext";
import { LogoutConfirmModal } from "./LogoutConfirmModal";
import FAQModal from "./FAQModal";
import { cn } from "../ui/utils";
import logo from "../../assets/LogoSinTexto.png";
import { SidebarTooltip } from "./SidebarTooltip";

export interface EventSidebarProps {
    color?: string;
    // position: 'left' (default) or 'right' to place the sidebar on the right side
    position?: 'left' | 'right';
}

interface NavLink {
    label: string;
    path: string;
    icon: LucideIcon;
}

/**
 * EventSidebar — Sidebar responsiva para navegación de eventos con color del rol.
 */
export function EventSidebar({ color: propColor, position = 'left' }: EventSidebarProps) {
    const { eventoId: paramId } = useParams<{ eventoId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { userName, logout } = useAuth();
    const eventContext = useContext(EventContext);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoadingLogout, setIsLoadingLogout] = useState(false);
    const [showFAQ, setShowFAQ] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    if (!eventContext) return null;

    const { eventoId: contextId, userRole, userColor: activeColor, isCollapsed, toggleSidebar } = eventContext;
    const eventoId = paramId || contextId;

    if (userRole === "Público") return null;
    
    // Dynamic role styles mapping para iconos y estados activos
    const roleStyles: Record<string, { text: string, bg: string }> = {
        "var(--color-org)": { text: "text-blue-600", bg: "bg-blue-50" },
        "#ea580c": { text: "text-orange-600", bg: "bg-orange-50" },
        "#9333ea": { text: "text-purple-600", bg: "bg-purple-50" },
        "#059669": { text: "text-emerald-600", bg: "bg-emerald-50" }
    };

    const activeStyle = roleStyles[activeColor || ""] || roleStyles["var(--color-org)"];

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

    // Secciones comunes
    const commonLinks: NavLink[] = [
        { label: "General", path: `/eventos/${eventoId}`, icon: Info },
        { label: "Proyectos", path: `/eventos/${eventoId}/proyectos`, icon: FolderOpen },
    ];

    // Secciones por rol
    const roleLinks: NavLink[] = [];
    


    if (userRole === "Organizador") {
        roleLinks.push({ label: "Jurado", path: `/eventos/${eventoId}/jurado`, icon: ClipboardList });
        roleLinks.push({ label: "Control Estados", path: `/eventos/${eventoId}/control-estados`, icon: Timer });
        roleLinks.push({ label: "Votación", path: `/eventos/${eventoId}/configuraciones`, icon: Lightbulb });
        roleLinks.push({ label: "Premios", path: `/eventos/${eventoId}/premios`, icon: Trophy });
        roleLinks.push({ label: "Editar Evento", path: `/eventos/${eventoId}/ajustes`, icon: Settings });
    } else if (userRole === "Jurado") {
        roleLinks.push({ label: "Votaciones", path: `/eventos/${eventoId}/votar`, icon: Vote });
    } else if (userRole === "Participante") {

        roleLinks.push({ label: "Registrar Proyecto", path: `/eventos/${eventoId}/participantRegister`, icon: FileText });

        if (localStorage.getItem("proyectoABCD")) {
            roleLinks.push({ label: "Mis Proyectos", path: `/eventos/${eventoId}/my-project`, icon: List });
        }
    }

    const allLinks = [...commonLinks, ...roleLinks];

 const NavItem = ({ link }: { link: NavLink }) => {
  const isActive = location.pathname === link.path;
  const Icon = link.icon;

  return (
    <SidebarTooltip
      label={link.label}
      isCollapsed={isCollapsed}
      side="right"
    >
      <Link
        to={link.path}
        className={cn(
          "flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 flex-shrink-0",
          isActive
            ? cn(activeStyle.bg, activeStyle.text, "font-semibold shadow-sm")
            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
          isCollapsed && "lg:justify-center lg:px-0 lg:w-12 lg:mx-auto"
        )}
      >
        <Icon
          size={22}
          strokeWidth={isActive ? 2.5 : 2}
          color={isActive ? (activeColor || undefined) : "currentColor"}
        />
        {!isCollapsed && (
          <span className="text-[11px] lg:text-sm font-medium max-w-[52px] lg:max-w-none truncate lg:whitespace-normal" title={link.label}>
            {link.label}
          </span>
        )}
        {isCollapsed && <span className="text-[11px] lg:hidden font-medium">{link.label}</span>}
      </Link>
    </SidebarTooltip>
  );
};

    const isRight = position === 'right';

    return (
        <>
            {/* Desktop Sidebar (lg and up) */}
            <aside className={cn(
                "hidden lg:flex flex-col fixed top-6 bottom-6 z-40 bg-white shadow-xl rounded-2xl transition-all duration-300",
                isRight ? 'right-4' : 'left-4',
                isCollapsed ? "w-20" : "w-64"
            )}>
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className={cn(
                        "absolute top-10 h-8 w-8 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:scale-110 transition-all z-50 cursor-pointer",
                        isRight ? '-left-4' : '-right-4'
                    )}
                >
                    {/* Icon direction should be mirrored when sidebar is right */}
                    {isCollapsed ? (isRight ? <ChevronLeft size={20} strokeWidth={2.5} /> : <ChevronRight size={20} strokeWidth={2.5} />) : (isRight ? <ChevronRight size={20} strokeWidth={2.5} /> : <ChevronLeft size={20} strokeWidth={2.5} />)}
                </button>

                {/* Logo Section */}
                <div 
                    className={cn(
                        "flex items-center gap-3 text-[1.25rem] font-bold font-heading tracking-tight px-4 py-8 mb-4 cursor-pointer group",
                        isCollapsed && "justify-center px-0"
                    )}
                    onClick={() => navigate("/eventos")}
                >
                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-slate-100 transition-colors">
                        <img src={logo} alt="Votify" className="w-7 h-7 object-contain" />
                    </div>
                    {!isCollapsed && <span className="text-slate-900">Votify</span>}
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    {allLinks.map((link) => (
                        <NavItem key={link.path} link={link} />
                    ))}

                    {/* Ayuda / FAQ link */}
                    <SidebarTooltip
                      label="Ayuda"
                      isCollapsed={isCollapsed}
                      side="right"
                    >
                    <button
                        onClick={() => setShowFAQ(true)}
                            className={cn(
                              "flex flex-col lg:flex-row items-center gap-1 lg:gap-3 px-3 py-2.5 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 text-   slate-500 hover:text-slate-900 hover:bg-slate-50 mt-auto",
                            isCollapsed && "lg:justify-center lg:px-0 lg:w-12 lg:mx-auto"
                          )}
                        >
                        <HelpCircle size={22} strokeWidth={2} color="currentColor" />
                            {!isCollapsed && <span className="text-[11px] lg:text-sm font-medium">Ayuda</span>}
                            {isCollapsed && <span className="text-[11px] lg:hidden font-medium">Ayuda</span>}
                        </button>
                    </SidebarTooltip>
                </nav>

                {/* User Profile Section (Bottom) */}
<div className="relative mt-auto border-t border-slate-100 pt-4 px-2" ref={menuRef}>
  <SidebarTooltip
    label={userName || "Usuario"}
    isCollapsed={isCollapsed}
    side="right"
  >
    <div 
      className={cn(
        "flex items-center justify-between gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-xl transition-all",
        isCollapsed && "justify-center"
      )}
      onClick={() => setIsMenuOpen(!isMenuOpen)}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-medium text-sm shadow-sm ring-2 ring-slate-50 group-hover:ring-slate-100 transition-all flex-shrink-0">
          {initials}
        </div>
        {!isCollapsed && (
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-bold truncate text-slate-900">{userName || "Usuario"}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{userRole || "Invitado"}</p>
          </div>
        )}
      </div>
      {!isCollapsed && (
        <ChevronUp 
          size={16} 
          strokeWidth={2.5} 
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${isMenuOpen ? "rotate-180" : ""}`} 
        />
      )}
    </div>
  </SidebarTooltip>

  {/* Pop-up Menu - solo visible cuando no está colapsado */}
  {!isCollapsed && isMenuOpen && (
    <div className="absolute bottom-full mb-2 left-2 right-2 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-200 text-slate-700">
      <button 
        onClick={() => navigate("/perfil")}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
      >
        <User size={16} className="text-slate-400" />
        Mi Perfil
      </button>
      <button 
        onClick={() => navigate("/ayuda")}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 transition-colors"
      >
        <HelpCircle size={16} className="text-slate-400" />
        Ayuda
      </button>
      <div className="h-px bg-slate-100 my-1 mx-2" />
      <button 
        onClick={() => {
          setIsMenuOpen(false);
          setShowLogoutModal(true);
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

            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onConfirm={() => {
                    setIsLoadingLogout(true);
                    setTimeout(() => {
                        logout();
                        navigate('/login');
                    }, 300);
                }}
                onCancel={() => setShowLogoutModal(false)}
                isLoading={isLoadingLogout}
            />

            {/* Mobile Navigation (under lg) */}
            {/* Backdrop for expanded grid */}
            {mobileNavOpen && (
                <div
                    className="fixed inset-0 z-[45] lg:hidden"
                    onClick={() => setMobileNavOpen(false)}
                />
            )}

            {/* Expanded grid panel */}
            {mobileNavOpen && (
                <div className="fixed bottom-[84px] left-4 right-4 z-[50] lg:hidden bg-white rounded-2xl shadow-xl border border-slate-100 p-3">
                    <div className="grid grid-cols-4 gap-1">
                        {allLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            const Icon = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setMobileNavOpen(false)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 px-2 py-3 rounded-xl transition-all",
                                        isActive
                                            ? cn(activeStyle.bg, activeStyle.text, "font-semibold")
                                            : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} color={isActive ? (activeColor || undefined) : "currentColor"} />
                                    <span className="text-[10px] font-medium text-center leading-tight">{link.label}</span>
                                </Link>
                            );
                        })}
                        <button
                            onClick={() => { setShowFAQ(true); setMobileNavOpen(false); }}
                            className="flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all"
                        >
                            <HelpCircle size={22} strokeWidth={2} />
                            <span className="text-[10px] font-medium">Ayuda</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Scrollable bottom bar */}
            <nav className={cn(
                "flex lg:hidden fixed bottom-4 left-4 right-4 h-[68px] bg-white items-center",
                "overflow-x-auto gap-1 px-3 z-50 rounded-2xl shadow-xl",
                "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            )}>
                {allLinks.map((link) => (
                    <NavItem key={link.path} link={link} />
                ))}
                <button
                    onClick={() => setShowFAQ(true)}
                    className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 flex-shrink-0"
                >
                    <HelpCircle size={22} strokeWidth={2} />
                    <span className="text-[11px] font-medium">Ayuda</span>
                </button>
                {/* Expand button */}
                <button
                    onClick={() => setMobileNavOpen(!mobileNavOpen)}
                    className={cn(
                        "flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all duration-200 flex-shrink-0",
                        mobileNavOpen ? cn(activeStyle.bg, activeStyle.text) : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                    )}
                >
                    <ChevronUp size={22} strokeWidth={2} className={cn("transition-transform duration-200", mobileNavOpen && "rotate-180")} />
                    <span className="text-[11px] font-medium">Más</span>
                </button>
            </nav>

            {/* FAQ Modal */}
            <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
        </>
    );
}
