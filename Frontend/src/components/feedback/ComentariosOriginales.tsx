import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import { comentariosApi } from "../../api/comentariosApi";
import { ComentarioOriginal, TipoSintesis } from "../../types/sintesis";
import { cn } from "../ui/utils";

export interface ComentariosOriginalesProps {
    idProyecto: number;
    idCategoria: number;
    tipo: TipoSintesis;
    /** Color de acento del tipo (jurado naranja / público verde). */
    accentColor: string;
    /** Si es true, se muestra expandido por defecto y se oculta el botón de toggle. */
    alwaysOpen?: boolean;
}

interface UsuarioComentario {
    referencia: string;
    nombre: string;
    iniciales: string;
    totalComentarios: number;
}

interface GrupoComentarista {
    tipo: string;
    totalComentarios: number;
    usuarios: UsuarioComentario[];
}

function obtenerIniciales(nombre?: string | null, email?: string | null): string {
    const fuente = nombre || email || "";
    if (!fuente) return "AN";
    const partes = fuente.split(/[\s@.]+/).filter(Boolean);
    if (partes.length === 0) return "AN";
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[1][0]).toUpperCase();
}

/**
 * Parses the combined comment format stored by the backend:
 *   "[GENERAL] globalComment\n\n---\n\ncriterionComment"
 * Returns { general?, criterion? }
 */
function parseCombinedComment(texto: string): { general?: string; criterion?: string } {
    if (!texto.includes('[GENERAL]')) return { criterion: texto };
    const [rawGeneral, rawCriterion] = texto.split('\n\n---\n\n');
    return {
        general: rawGeneral.replace('[GENERAL]', '').trim() || undefined,
        criterion: rawCriterion?.trim() || undefined,
    };
}

function formatFecha(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleString("es-ES", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

/**
 * Panel que muestra los comentarios originales (con autor) en los que
 * se basa la síntesis. Carga lazy al expandir o al montar si alwaysOpen.
 */
export function ComentariosOriginales({
    idProyecto,
    idCategoria,
    tipo,
    accentColor,
    alwaysOpen = false,
}: ComentariosOriginalesProps) {
    const [open, setOpen] = useState(alwaysOpen);
    const [cargando, setCargando] = useState(false);
    const [comentarios, setComentarios] = useState<ComentarioOriginal[] | null>(null);

    const cargarComentarios = async () => {
        if (!idProyecto || !idCategoria) return;
        setCargando(true);
        try {
            const grupos: GrupoComentarista[] = await comentariosApi.getResumen(idProyecto, idCategoria);
            const labelGrupo = (tipo || "").toLowerCase() === "jurado" ? "jurado" : "público";

            // Búsqueda case-insensitive para el tipo de grupo
            const grupo = grupos.find(g => (g.tipo || "").toLowerCase() === labelGrupo);

            if (!grupo || !grupo.usuarios || grupo.usuarios.length === 0) {
                setComentarios([]);
                return;
            }

            const detallesPromises = grupo.usuarios.map(u => 
                comentariosApi.getDetalleUsuario(idProyecto, idCategoria, u.referencia)
            );
            
            const resultados = await Promise.all(detallesPromises);
            
            const lista: ComentarioOriginal[] = [];
            resultados.forEach((detalleList, idx) => {
                const u = grupo.usuarios[idx];
                detalleList.forEach((d: any) => {
                    lista.push({
                        id: d.id,
                        comentario: d.comentario,
                        fecha: d.fecha,
                        nombreUsuario: u.nombre,
                        email: u.referencia
                    });
                });
            });

            setComentarios(lista);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error al cargar comentarios";
            toast.error(message);
            setComentarios([]);
        } finally {
            setCargando(false);
        }
    };

    // Carga inicial y recarga cuando cambian los IDs
    useEffect(() => {
        if (alwaysOpen) {
            cargarComentarios();
        } else {
            setComentarios(null);
            setOpen(false);
        }
    }, [idProyecto, idCategoria, alwaysOpen]);

    const handleToggle = async () => {
        if (alwaysOpen) return;
        const next = !open;
        setOpen(next);
        if (next && comentarios === null) {
            await cargarComentarios();
        }
    };

    const total = comentarios?.length ?? 0;

    return (
        <div className={cn(
            "rounded-2xl overflow-hidden transition-all",
            alwaysOpen ? "bg-transparent" : "border border-slate-100 bg-slate-50/40"
        )}>
            {!alwaysOpen && (
                <button
                    type="button"
                    onClick={handleToggle}
                    aria-expanded={open}
                    className={cn(
                        "w-full flex items-center justify-between gap-3 px-4 py-3",
                        "hover:bg-slate-100/60 transition-colors text-left"
                    )}
                >
                    <div className="flex items-center gap-2.5">
                        <MessageSquare size={18} strokeWidth={2} style={{ color: accentColor }} />
                        <span className="text-sm font-medium text-slate-700">
                            Ver comentarios originales
                        </span>
                        {comentarios !== null && (
                            <span className="text-xs text-slate-400">({total})</span>
                        )}
                    </div>
                    {open ? (
                        <ChevronUp size={18} strokeWidth={2} className="text-slate-400" />
                    ) : (
                        <ChevronDown size={18} strokeWidth={2} className="text-slate-400" />
                    )}
                </button>
            )}

            {(open || alwaysOpen) && (
                <div className={cn(
                    "pb-4 pt-1",
                    !alwaysOpen && "px-4 border-t border-slate-100"
                )}>
                    {cargando ? (
                        <div className="flex flex-col gap-3 mt-2">
                             {[1, 2].map(i => (
                                <div key={i} className="h-20 bg-slate-100/50 animate-pulse rounded-xl" />
                             ))}
                        </div>
                    ) : !comentarios || comentarios.length === 0 ? (
                        <p className="text-sm text-slate-500 italic py-3">
                            No hay comentarios para mostrar.
                        </p>
                    ) : (
                        <ul className="flex flex-col gap-3 mt-2 max-h-[420px] overflow-y-auto pr-1">
                            {comentarios.map((c) => (
                                <li
                                    key={c.id}
                                    className="flex items-start gap-3 bg-white rounded-xl p-3 border border-slate-100 shadow-sm"
                                >
                                    <div
                                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                        style={{ backgroundColor: accentColor }}
                                        aria-hidden
                                    >
                                        {c.nombreUsuario || c.email ? (
                                            obtenerIniciales(c.nombreUsuario, c.email)
                                        ) : (
                                            <User size={12} strokeWidth={2.25} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-0.5">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {c.nombreUsuario || c.email || "Anónimo"}
                                            </p>
                                            <span className="text-[10px] text-slate-400 flex-shrink-0">
                                                {formatFecha(c.fecha)}
                                            </span>
                                        </div>
                                        {(() => {
                                            const { general, criterion } = parseCombinedComment(c.comentario ?? '');
                                            return (
                                                <div className="space-y-1.5">
                                                    {general && (
                                                        <div>
                                                            <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full mb-1">
                                                                General
                                                            </span>
                                                            <p className="text-xs text-slate-600 leading-relaxed">{general}</p>
                                                        </div>
                                                    )}
                                                    {criterion && (
                                                        <div className={cn(general && "border-t border-slate-100 pt-1.5")}>
                                                            {!general && (
                                                                <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full mb-1">
                                                                    Criterio
                                                                </span>
                                                            )}
                                                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">{criterion}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default ComentariosOriginales;
