import { Plus, Trash2, Zap, AlertCircle, Lock } from "lucide-react";

/**
 * Plantillas de baremos predefinidas.
 * Cada plantilla define un nombre de baremo y sus criterios con pesos.
 */
interface PlantillaBaremo {
    label: string;
    baremoNombre: string;
    criterios: { nombre: string; peso: number }[];
}

const PLANTILLAS_BAREMOS: Record<string, PlantillaBaremo> = {
    hackathon: {
        label: "Hackathon estándar",
        baremoNombre: "Hackathon estándar",
        criterios: [
            { nombre: "Innovación", peso: 40 },
            { nombre: "Diseño UI/UX", peso: 35 },
            { nombre: "Viabilidad", peso: 25 },
        ],
    },
    pitch: {
        label: "Pitch Competition",
        baremoNombre: "Pitch Competition",
        criterios: [
            { nombre: "Modelo de Negocio", peso: 30 },
            { nombre: "Presentación", peso: 25 },
            { nombre: "Escalabilidad", peso: 25 },
            { nombre: "Equipo", peso: 20 },
        ],
    },
    feria: {
        label: "Feria de Innovación",
        baremoNombre: "Feria de Innovación",
        criterios: [
            { nombre: "Originalidad", peso: 30 },
            { nombre: "Impacto Social", peso: 30 },
            { nombre: "Ejecución Técnica", peso: 25 },
            { nombre: "Presentación Visual", peso: 15 },
        ],
    },
};

interface Dimension {
    id: string;
    nombre: string;
    peso: number;
    comentarioObligatorio?: boolean;
}

const StepReglas = ({ data, onChange, readOnlyBaremos = false }: { data: any, onChange: any, readOnlyBaremos?: boolean }) => {
    const applyPlantilla = (key: string) => {
        if (readOnlyBaremos) return;
        const p = PLANTILLAS_BAREMOS[key];
        const newDimensions = p.criterios.map((c) => ({
            id: crypto.randomUUID(),
            nombre: c.nombre,
            peso: c.peso,
        }));
        onChange({ ...data, plantilla: key, baremoNombre: p.baremoNombre, dimensiones: newDimensions });
    };

    const addDimension = () => {
        if (readOnlyBaremos) return;
        const newDim = { id: crypto.randomUUID(), nombre: "", peso: 0, comentarioObligatorio: false };
        onChange({ ...data, dimensiones: [...data.dimensiones, newDim] });
    };

    const removeDimension = (id: string) => {
        if (readOnlyBaremos) return;
        const filtered = data.dimensiones.filter((d: Dimension) => d.id !== id);
        onChange({ ...data, dimensiones: filtered });
    };

    const updateDimension = (id: string, field: keyof Dimension, value: any) => {
        if (readOnlyBaremos) return;
        const newDimensions = data.dimensiones.map((d: Dimension) =>
            d.id === id ? { ...d, [field]: value } : d
        );
        onChange({ ...data, dimensiones: newDimensions });
    };

    const totalPeso = data.dimensiones.reduce((sum: number, d: Dimension) => sum + d.peso, 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Aviso de solo lectura */}
            {readOnlyBaremos && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-900">Baremos bloqueados</p>
                        <p className="text-xs text-amber-700">No puedes editar los criterios porque el evento ya tiene votos o está activo.</p>
                    </div>
                </div>
            )}

            {/* Plantillas Rápidas */}
            <div className="space-y-3">
                <label className="text-gray-400 text-[11px] font-black uppercase tracking-widest ml-1">
                    Plantillas de Evaluación
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {Object.entries(PLANTILLAS_BAREMOS).map(([key, p]) => (
                        <button
                            key={key}
                            type="button"
                            disabled={readOnlyBaremos}
                            onClick={() => applyPlantilla(key)}
                            className={`p-4 rounded-2xl border-2 transition-all text-left flex flex-col gap-1 group disabled:opacity-50 ${
                                data.plantilla === key
                                    ? "border-org bg-blue-50/50 shadow-sm"
                                    : "border-gray-100 hover:border-gray-200 bg-white"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className={`text-sm font-bold ${data.plantilla === key ? "text-org" : "text-gray-700"}`}>
                                    {p.label}
                                </span>
                                <Zap className={`w-4 h-4 ${data.plantilla === key ? "text-org" : "text-gray-300 group-hover:text-gray-400"}`} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">
                                {p.criterios.length} dimensiones configuradas
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Dimensiones / Criterios */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-gray-400 text-[11px] font-black uppercase tracking-widest ml-1">
                        Dimensiones de Evaluación
                    </label>
                    <button
                        type="button"
                        disabled={readOnlyBaremos}
                        onClick={addDimension}
                        className="text-org font-bold text-xs flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                        <Plus className="w-3 h-3" /> Añadir Criterio
                    </button>
                </div>

                <div className="space-y-3">
                    {data.dimensiones.map((dim: Dimension, index: number) => (
                        <div
                            key={dim.id}
                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-4 animate-in slide-in-from-right-4 duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Nombre del criterio (Ej: Innovación)"
                                        value={dim.nombre}
                                        disabled={readOnlyBaremos}
                                        onChange={(e) => updateDimension(dim.id, "nombre", e.target.value)}
                                        className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-org/20 outline-none transition-all disabled:opacity-50"
                                    />
                                </div>
                                <div className="w-24 relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="0"
                                        value={dim.peso || ""}
                                        disabled={readOnlyBaremos}
                                        onChange={(e) => updateDimension(dim.id, "peso", parseInt(e.target.value) || 0)}
                                        className="w-full bg-gray-50 border-none rounded-xl pl-4 pr-8 py-2.5 text-sm font-black text-center text-gray-700 focus:ring-2 focus:ring-org/20 outline-none transition-all disabled:opacity-50"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">%</span>
                                </div>
                                {!readOnlyBaremos && (
                                    <button
                                        onClick={() => removeDimension(dim.id)}
                                        className="p-2 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-3 px-1">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={dim.comentarioObligatorio || false}
                                        onChange={(e) => updateDimension(dim.id, "comentarioObligatorio", e.target.checked)}
                                        disabled={readOnlyBaremos}
                                        className="w-4 h-4 rounded border-gray-300 text-org focus:ring-org cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <span className="text-xs font-bold text-gray-500 group-hover:text-gray-700 transition-colors">
                                        Comentario obligatorio para este criterio
                                    </span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>

                {data.dimensiones.length === 0 && (
                    <div className="text-center py-10 bg-gray-50/50 rounded-[32px] border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 text-sm font-medium">No hay criterios definidos.</p>
                        <p className="text-gray-300 text-[10px] mt-1 uppercase font-black">Usa una plantilla o añade uno manualmente</p>
                    </div>
                )}
            </div>

            {/* Resumen de Pesos */}
            <div className={`p-6 rounded-3xl border-2 transition-all ${
                totalPeso === 100 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
            }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${totalPeso === 100 ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            <AlertCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <p className={`text-sm font-bold ${totalPeso === 100 ? "text-green-900" : "text-red-900"}`}>
                                Suma Total: {totalPeso}%
                            </p>
                            <p className={`text-[10px] font-medium ${totalPeso === 100 ? "text-green-600" : "text-red-600"}`}>
                                {totalPeso === 100 ? "Distribución de pesos correcta" : "El total debe ser exactamente 100%"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StepReglas;
