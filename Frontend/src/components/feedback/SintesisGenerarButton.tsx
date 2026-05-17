import { Sparkles, RefreshCw, Loader2, LucideIcon } from "lucide-react";
import { TipoSintesis } from "../../types/sintesis";
import { cn } from "../ui/utils";

export interface SintesisGenerarButtonProps {
    tipo: TipoSintesis;
    /** ¿La categoría ya está finalizada? */
    categoriaFinalizada: boolean;
    /** Nº de comentarios disponibles del tipo correspondiente. */
    comentariosCount: number;
    /** ¿Hay ya una síntesis previa? Si la hay, el botón pasa a "Regenerar". */
    yaExiste: boolean;
    /** ¿Está cargando la generación ahora mismo? */
    cargando: boolean;
    onClick: () => void;
}

const COLOR_JURADO = "#F97316";
const COLOR_PUBLICO = "#10B981";
const MIN_COMENTARIOS = 2;

/**
 * Botón con los 6 estados definidos en la spec § 6:
 *  1. Categoría no finalizada -> disabled, tooltip
 *  2. Comentarios < 2          -> disabled, tooltip
 *  3. Sin síntesis previa      -> "Generar síntesis"
 *  4. Cargando                 -> spinner + "Analizando comentarios..."
 *  5. Síntesis existente       -> "Regenerar" (secundario) + aviso
 *  6. Error                    -> manejado por el padre vía toast.error
 */
export function SintesisGenerarButton({
    tipo,
    categoriaFinalizada,
    comentariosCount,
    yaExiste,
    cargando,
    onClick,
}: SintesisGenerarButtonProps) {
    const color = tipo === "jurado" ? COLOR_JURADO : COLOR_PUBLICO;

    // Determinar estado y tooltip
    let disabled = cargando;
    let tooltip: string | undefined;
    let label: string;
    let Icon: LucideIcon = Sparkles;
    let isSecondary = false;

    if (cargando) {
        label = "Analizando comentarios...";
        Icon = Loader2;
    } else if (!categoriaFinalizada) {
        disabled = true;
        tooltip = "Disponible al cerrar la votación";
        label = "Generar síntesis";
    } else if (comentariosCount < MIN_COMENTARIOS) {
        disabled = true;
        tooltip = `Necesitas al menos ${MIN_COMENTARIOS} comentarios`;
        label = "Generar síntesis";
    } else if (yaExiste) {
        label = "Regenerar";
        Icon = RefreshCw;
        isSecondary = true;
    } else {
        label = "Generar síntesis";
    }

    return (
        <div className="flex flex-col items-start gap-1.5">
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                title={tooltip}
                className={cn(
                    "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-heading font-semibold text-sm",
                    "transition-all duration-200 shadow-sm",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !disabled && "hover:shadow-md hover:scale-[1.02] cursor-pointer",
                    isSecondary
                        ? "bg-white border-2"
                        : "text-white"
                )}
                style={
                    isSecondary
                        ? { color, borderColor: color }
                        : { backgroundColor: color }
                }
                aria-label={label}
            >
                <Icon
                    size={18}
                    strokeWidth={2.25}
                    className={cargando ? "animate-spin" : undefined}
                />
                <span>{label}</span>
            </button>

            {yaExiste && !cargando && categoriaFinalizada && comentariosCount >= MIN_COMENTARIOS && (
                <p className="text-xs text-slate-500">
                    Reemplazará la síntesis actual
                </p>
            )}
        </div>
    );
}

export default SintesisGenerarButton;
