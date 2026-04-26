import { Calendar, ArrowRight } from "lucide-react";
import { clsx } from "clsx";

/**
 * Configuración visual por rol.
 */
const rolesConfig = {
    Organizador: {
        label: "Organizador",
        bgClass: "bg-[var(--color-org)]/10",
        textClass: "text-[var(--color-org)]",
    },
    Participante: {
        label: "Participante",
        bgClass: "bg-[var(--color-part)]/10",
        textClass: "text-[var(--color-part)]",
    },
    Jurado: {
        label: "Jurado",
        bgClass: "bg-[var(--color-jur)]/10",
        textClass: "text-[var(--color-jur)]",
    },
    Publico: {
        label: "Público",
        bgClass: "bg-[var(--color-pub)]/10",
        textClass: "text-[var(--color-pub)]",
    },
};

/**
 * Configuración visual por estado del evento.
 */
const estadoConfig = {
    Configuracion: { label: "Configuración", color: "text-muted-foreground", bg: "bg-muted" },
    Activo: { label: "Activo", color: "text-[var(--color-pub)]", bg: "bg-[var(--color-pub)]/10" },
    Abierto: { label: "Abierto", color: "text-[var(--color-pub)]", bg: "bg-[var(--color-pub)]/10" },
    EnCurso: { label: "En Curso", color: "text-[var(--color-org)]", bg: "bg-[var(--color-org)]/10" },
    EnVotacion: { label: "En Votación", color: "text-[var(--color-jur)]", bg: "bg-[var(--color-jur)]/10" },
    Finalizado: { label: "Finalizado", color: "text-muted-foreground", bg: "bg-muted" },
};

/**
 * Formatea un rango de fechas para mostrarlo en la tarjeta.
 * @param {string} fechaIni - ISO date string
 * @param {string} fechaFin - ISO date string
 */
function formatDateRange(fechaIni: string, fechaFin: string) {
    const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
    const ini = new Date(fechaIni).toLocaleDateString("es-ES", opts);
    const fin = new Date(fechaFin).toLocaleDateString("es-ES", opts);
    return ini === fin ? ini : `${ini} - ${fin}`;
}

interface EventCardProps {
    nombre: string;
    descripcion?: string;
    fechaIni: string;
    fechaFin: string;
    estado: keyof typeof estadoConfig;
    rol: keyof typeof rolesConfig;
    onClick?: () => void;
}

/**
 * EventCard — Tarjeta de un evento.
 */
export function EventCard({ nombre, descripcion, fechaIni, fechaFin, estado, rol, onClick }: EventCardProps) {
    const roleData = rolesConfig[rol] || rolesConfig.Publico;
    const estadoData = estadoConfig[estado] || estadoConfig.Configuracion;

    const handleCardClick = () => {
        // 1. Guardamos el objeto completo (convertido a string)
        const roleToStore = { 
            label: roleData.label,
            bgClass: roleData.bgClass, 
            textClass: roleData.textClass 
        };
        
        localStorage.setItem("propsRol", JSON.stringify(roleToStore));

        // 2. Ejecutamos la navegación o lógica original
        if (onClick) onClick();
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-card rounded-2xl p-6 border border-border shadow-base hover:shadow-hover hover:-translate-y-[2px] transition-all group cursor-pointer flex flex-col h-full"
        >

            {/* Header: Estado + Rol Badge */}
            <div className="flex justify-between items-start mb-4">
                <span className={clsx("px-2.5 py-1 rounded-lg text-xs font-semibold", estadoData.bg, estadoData.color)}>
                    {estadoData.label}
                </span>
                <span className={clsx("px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase", roleData.bgClass, roleData.textClass)}>
                    {roleData.label}
                </span>
            </div>

            {/* Body */}
            <div className="flex-1">
                <h3 className="font-heading font-semibold text-xl text-foreground leading-snug mb-2 group-hover:text-[var(--color-org)] transition-colors line-clamp-2">
                    {nombre}
                </h3>
                {descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{descripcion}</p>
                )}
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-body">
                    <Calendar size={15} strokeWidth={1.75} className="shrink-0" />
                    <span>{formatDateRange(fechaIni, fechaFin)}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-5 flex justify-end">
                <button className="flex items-center gap-1.5 text-muted-foreground group-hover:text-[var(--color-org)] font-medium text-sm transition-colors">
                    Entrar <ArrowRight size={16} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
