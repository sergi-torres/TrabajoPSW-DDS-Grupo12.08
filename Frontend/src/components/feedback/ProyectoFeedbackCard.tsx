import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, Folder, AlertCircle } from "lucide-react";
import { getSintesisProyecto, generarSintesis } from "../../api/sintesisApi";
import { SintesisDto, SintesisProyecto, TipoSintesis } from "../../types/sintesis";
import { SintesisGenerarButton } from "./SintesisGenerarButton";
import { SintesisDisplay } from "./SintesisDisplay";
import { ComentariosOriginales } from "./ComentariosOriginales";

export interface ProyectoFeedbackCardProps {
    idProyecto: number;
    nombreProyecto: string;
    idCategoria: number;
    nombreCategoria: string;
    /** Estado actual de la categoría: la síntesis solo está disponible si === "Finalizada". */
    estadoCategoria: string;
    /** Comentarios disponibles por tipo (para gating del botón). */
    comentariosJuradoCount: number;
    comentariosPublicoCount: number;
}

const COLOR_JURADO = "#F97316";
const COLOR_PUBLICO = "#10B981";

interface SubseccionState {
    cargandoFetch: boolean;
    cargandoGen: boolean;
    sintesis: SintesisDto | null;
}

// Synthesis controls are only rendered when the category is "Finalizada" —
// the backend would reject generation requests for non-final categories anyway.
export function ProyectoFeedbackCard({
    idProyecto,
    idCategoria,
    estadoCategoria,
    comentariosJuradoCount,
    comentariosPublicoCount,
}: ProyectoFeedbackCardProps) {
    const [estadoJurado, setEstadoJurado] = useState<SubseccionState>({
        cargandoFetch: false,
        cargandoGen: false,
        sintesis: null,
    });
    const [estadoPublico, setEstadoPublico] = useState<SubseccionState>({
        cargandoFetch: false,
        cargandoGen: false,
        sintesis: null,
    });

    const finalizada = estadoCategoria?.toLowerCase() === "finalizada";

    useEffect(() => {
        let cancelled = false;
        const cargar = async () => {
            setEstadoJurado((p) => ({ ...p, cargandoFetch: true }));
            setEstadoPublico((p) => ({ ...p, cargandoFetch: true }));
            try {
                const data: SintesisProyecto = await getSintesisProyecto(idProyecto, idCategoria);
                if (cancelled) return;
                setEstadoJurado((p) => ({ ...p, sintesis: data.jurado, cargandoFetch: false }));
                setEstadoPublico((p) => ({ ...p, sintesis: data.publico, cargandoFetch: false }));
            } catch {
                if (cancelled) return;
                setEstadoJurado((p) => ({ ...p, cargandoFetch: false }));
                setEstadoPublico((p) => ({ ...p, cargandoFetch: false }));
            }
        };
        cargar();
        return () => { cancelled = true; };
    }, [idProyecto, idCategoria]);

    const handleGenerar = async (tipo: TipoSintesis) => {
        const setEstado = tipo === "jurado" ? setEstadoJurado : setEstadoPublico;
        setEstado((p) => ({ ...p, cargandoGen: true }));
        try {
            const nueva = await generarSintesis(idProyecto, idCategoria, tipo);
            setEstado((p) => ({ ...p, sintesis: nueva, cargandoGen: false }));
            toast.success(`Síntesis del ${tipo} generada correctamente`);
        } catch (err) {
            setEstado((p) => ({ ...p, cargandoGen: false }));
            toast.error(err instanceof Error ? err.message : "Error al generar síntesis");
        }
    };

    return (
        <div className="space-y-10">
            {/* Aviso si la categoría aún no está finalizada */}
            {!finalizada && (
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
                    <AlertCircle size={18} strokeWidth={2.25} className="text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-900 leading-relaxed">
                        <strong className="font-semibold">Votación en curso.</strong>{" "}
                        La síntesis por IA estará disponible cuando se cierre la votación, 
                        pero ya puedes ver los comentarios conforme llegan.
                    </div>
                </div>
            )}

            {/* FEEDBACK JURADO */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-500">
                            <Sparkles size={24} strokeWidth={2.25} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-slate-900">Feedback del Jurado</h2>
                            <p className="text-sm text-slate-500">Evaluación técnica y profesional</p>
                        </div>
                    </div>
                    <SintesisGenerarButton
                        tipo="jurado"
                        categoriaFinalizada={finalizada}
                        comentariosCount={comentariosJuradoCount}
                        yaExiste={estadoJurado.sintesis !== null}
                        cargando={estadoJurado.cargandoGen}
                        onClick={() => handleGenerar("jurado")}
                    />
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                    <div className="xl:col-span-3 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Síntesis IA
                        </h3>
                        {estadoJurado.sintesis ? (
                            <SintesisDisplay sintesis={estadoJurado.sintesis} />
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed rounded-3xl border-slate-100 bg-slate-50/50">
                                <p className="text-slate-400 text-sm">
                                    {finalizada ? "Pulsa generar para obtener el resumen" : "Disponible al finalizar el evento"}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="xl:col-span-2 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Folder size={14} /> Comentarios
                        </h3>
                        <ComentariosOriginales
                            idProyecto={idProyecto}
                            idCategoria={idCategoria}
                            tipo="jurado"
                            accentColor={COLOR_JURADO}
                            alwaysOpen={true}
                        />
                    </div>
                </div>
            </section>

            {/* FEEDBACK PÚBLICO */}
            <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-500">
                            <Sparkles size={24} strokeWidth={2.25} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-heading font-bold text-slate-900">Feedback del Público</h2>
                            <p className="text-sm text-slate-500">Impresión general y comunidad</p>
                        </div>
                    </div>
                    <SintesisGenerarButton
                        tipo="publico"
                        categoriaFinalizada={finalizada}
                        comentariosCount={comentariosPublicoCount}
                        yaExiste={estadoPublico.sintesis !== null}
                        cargando={estadoPublico.cargandoGen}
                        onClick={() => handleGenerar("publico")}
                    />
                </header>

                <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                    <div className="xl:col-span-3 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} /> Síntesis IA
                        </h3>
                        {estadoPublico.sintesis ? (
                            <SintesisDisplay sintesis={estadoPublico.sintesis} />
                        ) : (
                            <div className="py-10 text-center border-2 border-dashed rounded-3xl border-slate-100 bg-slate-50/50">
                                <p className="text-slate-400 text-sm">
                                    {finalizada ? "Pulsa generar para obtener el resumen" : "Disponible al finalizar el evento"}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="xl:col-span-2 space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <Folder size={14} /> Comentarios
                        </h3>
                        <ComentariosOriginales
                            idProyecto={idProyecto}
                            idCategoria={idCategoria}
                            tipo="publico"
                            accentColor={COLOR_PUBLICO}
                            alwaysOpen={true}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ProyectoFeedbackCard;
