import { Check, AlertTriangle, Smile, Meh, Frown, LucideIcon } from "lucide-react";
import { SintesisDto, Sentimiento, TipoSintesis } from "../../types/sintesis";
import { cn } from "../ui/utils";

export interface SintesisDisplayProps {
    sintesis: SintesisDto;
}

// Tokens de la guía de diseño
const COLOR_JURADO = "#F97316";
const COLOR_PUBLICO = "#10B981";
const COLOR_SUCCESS = "#22C55E";
const COLOR_WARNING = "#F59E0B";

const TIPO_LABEL: Record<TipoSintesis, string> = {
    jurado: "Jurado",
    publico: "Público",
};

const SENTIMIENTO_META: Record<
    Sentimiento,
    { label: string; icon: LucideIcon; color: string; bg: string }
> = {
    positivo: { label: "Positivo", icon: Smile, color: "#22C55E", bg: "#22C55E1A" },
    mixto: { label: "Mixto", icon: Meh, color: "#F59E0B", bg: "#F59E0B1A" },
    negativo: { label: "Negativo", icon: Frown, color: "#EF4444", bg: "#EF44441A" },
};

function formatFecha(iso: string): string {
    try {
        const d = new Date(iso);
        return d.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    } catch {
        return iso;
    }
}

/**
 * Card de síntesis con bordes rounded-[32px] y sombra suave (Guia_Diseño.md).
 * Estructura:
 *  - Header con badge tipo (Jurado naranja / Público verde) y badge sentimiento
 *  - Fortalezas: lista con check verde (Success #22C55E)
 *  - Mejoras: lista con AlertTriangle ámbar (Warning #F59E0B)
 *  - Resumen general como blockquote
 *  - Footer: "Basado en N comentarios · Generado el {fecha}"
 */
export function SintesisDisplay({ sintesis }: SintesisDisplayProps) {
    const tipoColor = sintesis.tipo === "jurado" ? COLOR_JURADO : COLOR_PUBLICO;
    const sentimiento = SENTIMIENTO_META[sintesis.sentimiento];
    const SentimientoIcon = sentimiento.icon;

    return (
        <article
            className={cn(
                "bg-white rounded-[32px] p-6 lg:p-8",
                "shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-slate-100"
            )}
            aria-label={`Síntesis ${TIPO_LABEL[sintesis.tipo]}`}
        >
            {/* Header */}
            <header className="flex flex-wrap items-center gap-3 mb-6">
                <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: tipoColor }}
                >
                    {TIPO_LABEL[sintesis.tipo]}
                </span>
                <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ color: sentimiento.color, backgroundColor: sentimiento.bg }}
                >
                    <SentimientoIcon size={14} strokeWidth={2.25} />
                    {sentimiento.label}
                </span>
            </header>

            {/* Fortalezas */}
            <section className="mb-6">
                <h3 className="text-sm font-heading font-bold text-slate-900 uppercase tracking-wide mb-3">
                    Fortalezas
                </h3>
                {sintesis.fortalezas.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Sin fortalezas detectadas.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {sintesis.fortalezas.map((f, idx) => (
                            <li
                                key={`f-${idx}`}
                                className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                            >
                                <span
                                    className="flex-shrink-0 mt-0.5 rounded-full p-0.5"
                                    style={{ backgroundColor: `${COLOR_SUCCESS}1A`, color: COLOR_SUCCESS }}
                                >
                                    <Check size={14} strokeWidth={3} />
                                </span>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Mejoras */}
            <section className="mb-6">
                <h3 className="text-sm font-heading font-bold text-slate-900 uppercase tracking-wide mb-3">
                    Áreas de mejora
                </h3>
                {sintesis.mejoras.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">Sin áreas de mejora detectadas.</p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {sintesis.mejoras.map((m, idx) => (
                            <li
                                key={`m-${idx}`}
                                className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed"
                            >
                                <span
                                    className="flex-shrink-0 mt-0.5 rounded-full p-0.5"
                                    style={{ backgroundColor: `${COLOR_WARNING}1A`, color: COLOR_WARNING }}
                                >
                                    <AlertTriangle size={14} strokeWidth={2.5} />
                                </span>
                                <span>{m}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Resumen general (blockquote) */}
            {sintesis.resumenGeneral && (
                <blockquote
                    className={cn(
                        "border-l-4 pl-4 py-2 italic text-slate-600 text-sm leading-relaxed mb-6",
                        "bg-slate-50/60 rounded-r-xl"
                    )}
                    style={{ borderLeftColor: tipoColor }}
                >
                    {sintesis.resumenGeneral}
                </blockquote>
            )}

            {/* Footer */}
            <footer className="pt-4 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-slate-400">
                        Basado en {sintesis.comentariosCount} comentario{sintesis.comentariosCount === 1 ? "" : "s"}
                        {" · "}
                        Generado el {formatFecha(sintesis.fechaGeneracion)}
                    </p>
                    {sintesis.modeloUsado && (
                        <p className="text-[10px] font-medium text-slate-300 uppercase tracking-tight">
                            AI: {sintesis.modeloUsado}
                        </p>
                    )}
                </div>
            </footer>
        </article>
    );
}

export default SintesisDisplay;
