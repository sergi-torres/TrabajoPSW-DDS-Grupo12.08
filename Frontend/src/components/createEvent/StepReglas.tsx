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
}

interface StepReglasProps {
    data: {
        plantilla: string;
        baremoNombre: string;
        dimensiones: Dimension[];
        analisisAutomatico: boolean;
    };
    onChange: (newData: any) => void;
    readOnlyBaremos?: boolean;
}

const StepReglas = ({ data, onChange, readOnlyBaremos = false }: StepReglasProps) => {
    const totalPeso = data.dimensiones.reduce((sum, d) => sum + d.peso, 0);

    /**
     * Al seleccionar una plantilla, carga automáticamente sus criterios predefinidos.
     * Si se elige "custom" o vacío, limpia las dimensiones para crearlas manualmente.
     */
    const handlePlantillaChange = (value: string) => {
        if (readOnlyBaremos) return;

        const plantilla = PLANTILLAS_BAREMOS[value];

        if (plantilla) {
            // Cargar criterios predefinidos de la plantilla
            const dimensiones = plantilla.criterios.map((c) => ({
                id: crypto.randomUUID(),
                nombre: c.nombre,
                peso: c.peso,
            }));
            onChange({
                ...data,
                plantilla: value,
                baremoNombre: plantilla.baremoNombre,
                dimensiones,
            });
        } else {
            // Personalizado o vacío: permitir crear desde cero
            onChange({
                ...data,
                plantilla: value,
                baremoNombre: value === "custom" ? "Personalizado" : "",
                dimensiones: [],
            });
        }
    };

    const addDimension = () => {
        if (readOnlyBaremos) return;
        const newDim: Dimension = {
            id: crypto.randomUUID(),
            nombre: "",
            peso: 0,
        };
        onChange({ ...data, dimensiones: [...data.dimensiones, newDim] });
    };

    const updateDimension = (id: string, field: keyof Dimension, value: string | number) => {
        if (readOnlyBaremos) return;
        onChange({
            ...data,
            dimensiones: data.dimensiones.map((d) =>
                d.id === id ? { ...d, [field]: value } : d
            ),
        });
    };

    const removeDimension = (id: string) => {
        if (readOnlyBaremos) return;
        onChange({
            ...data,
            dimensiones: data.dimensiones.filter((d) => d.id !== id),
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-heading font-semibold text-foreground">Baremos de Evaluación</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Define las reglas y criterios con los que se juzgarán los proyectos.
                </p>
            </div>

            {readOnlyBaremos && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 border border-warning/20">
                    <Lock className="w-4 h-4 text-warning" strokeWidth={1.75} />
                    <span className="text-sm text-warning font-medium">
                        Los baremos no se pueden editar porque el evento ya está en votación.
                    </span>
                </div>
            )}

            <div>
                <label className="text-sm font-medium text-muted-foreground">Cargar plantilla de baremos</label>
                <select
                    value={data.plantilla}
                    onChange={(e) => handlePlantillaChange(e.target.value)}
                    disabled={readOnlyBaremos}
                    className="mt-2 h-12 w-full rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org focus:border-org disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <option value="">Seleccionar plantilla (opcional)</option>
                    {Object.entries(PLANTILLAS_BAREMOS).map(([key, tmpl]) => (
                        <option key={key} value={key}>{tmpl.label}</option>
                    ))}
                    <option value="custom">Personalizado</option>
                </select>
            </div>

            <div className="rounded-lg shadow-base bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-heading font-semibold text-foreground">Dimensiones de Valor</h4>
                    <span
                        className={`text-sm font-heading font-bold ${totalPeso === 100 ? "text-success" : totalPeso === 0 ? "text-muted-foreground" : "text-error"}`}
                    >
                        Total: {totalPeso}%
                    </span>
                </div>

                {data.dimensiones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                        <p className="text-sm">
                            {data.plantilla
                                ? "No hay dimensiones definidas."
                                : "Selecciona una plantilla o añade dimensiones personalizadas."}
                        </p>
                        {!readOnlyBaremos && (
                            <button
                                onClick={addDimension}
                                className="mt-2 text-sm font-heading font-semibold text-foreground hover:text-org transition-colors"
                            >
                                Añadir una dimensión
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.dimensiones.map((dim) => (
                            <div key={dim.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <input
                                    placeholder="Nombre de la dimensión"
                                    value={dim.nombre}
                                    onChange={(e) => updateDimension(dim.id, "nombre", e.target.value)}
                                    disabled={readOnlyBaremos}
                                    className="flex-1 h-10 rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={dim.peso}
                                        onChange={(e) => updateDimension(dim.id, "peso", parseInt(e.target.value) || 0)}
                                        disabled={readOnlyBaremos}
                                        className="w-20 h-10 rounded-md border border-border bg-background px-2 font-body text-center focus:outline-none focus:ring-2 focus:ring-org disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                    <span className="text-sm text-muted-foreground font-medium">%</span>
                                </div>
                                <label className="flex items-center gap-1.5 ml-2 cursor-pointer" title="Comentario Obligatorio">
                                    <input 
                                        type="checkbox" 
                                        checked={dim.comentarioObligatorio || false}
                                        onChange={(e) => updateDimension(dim.id, "comentarioObligatorio", e.target.checked)}
                                        disabled={readOnlyBaremos}
                                        className="w-4 h-4 rounded text-org focus:ring-org border-border"
                                    />
                                    <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Obligatorio</span>
                                </label>
                                {!readOnlyBaremos && (
                                    <button
                                        onClick={() => removeDimension(dim.id)}
                                        className="p-2 rounded-md text-muted-foreground hover:text-error hover:bg-error-bg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!readOnlyBaremos && (
                    <button
                        onClick={addDimension}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-md text-sm font-heading font-semibold text-foreground hover:border-org hover:text-org transition-colors"
                    >
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        Añadir Dimensión
                    </button>
                )}

                {totalPeso !== 100 && totalPeso > 0 && (
                    <div className="flex items-center gap-2 text-sm text-warning">
                        <AlertCircle className="w-4 h-4" strokeWidth={1.75} />
                        <span>La suma de los pesos debe ser 100% (Actual: {totalPeso}%)</span>
                    </div>
                )}
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-info-bg">
                <Zap className="w-5 h-5 text-info mt-0.5" strokeWidth={1.75} />
                <div className="flex-1">
                    <h4 className="text-sm font-heading font-semibold text-foreground">
                        Activar sugerencias de análisis automático
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                        El sistema sugerirá análisis previos basados en los documentos y materiales que suban los concursantes al unirse.
                    </p>
                </div>
                <button
                    type="button"
                    role="switch"
                    aria-checked={data.analisisAutomatico}
                    onClick={() => onChange({ ...data, analisisAutomatico: !data.analisisAutomatico })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.analisisAutomatico ? 'bg-org' : 'bg-muted'}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.analisisAutomatico ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
            </div>
        </div>
    );
};

export default StepReglas;
