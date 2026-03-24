import { Plus, Trash2, Zap, AlertCircle } from "lucide-react";

const StepReglas = ({ data, onChange }) => {
    const totalPeso = data.dimensiones.reduce((sum, d) => sum + d.peso, 0);

    const addDimension = () => {
        const newDim = {
            id: crypto.randomUUID(),
            nombre: "",
            peso: 0,
        };
        onChange({ ...data, dimensiones: [...data.dimensiones, newDim] });
    };

    const updateDimension = (id, field, value) => {
        onChange({
            ...data,
            dimensiones: data.dimensiones.map((d) =>
                d.id === id ? { ...d, [field]: value } : d
            ),
        });
    };

    const removeDimension = (id) => {
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

            <div>
                <label className="text-sm font-medium text-muted-foreground">Cargar plantilla de baremos <span className="text-error">*</span></label>
                <select
                    value={data.plantilla}
                    onChange={(e) => onChange({ ...data, plantilla: e.target.value })}
                    className="mt-2 h-12 w-full rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org focus:border-org"
                >
                    <option value="" disabled>Seleccionar plantilla</option>
                    <option value="hackathon">Hackathon estándar</option>
                    <option value="pitch">Pitch Competition</option>
                    <option value="custom">Personalizado</option>
                </select>
            </div>

            <div className="rounded-lg shadow-base bg-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-heading font-semibold text-foreground">Dimensiones de Valor</h4>
                    <span
                        className={`text-sm font-heading font-bold ${totalPeso === 100 ? "text-success" : "text-error"}`}
                    >
                        Total: {totalPeso}%
                    </span>
                </div>

                {data.dimensiones.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border rounded-lg text-muted-foreground">
                        <p className="text-sm">No hay dimensiones definidas.</p>
                        <button
                            onClick={addDimension}
                            className="mt-2 text-sm font-heading font-semibold text-foreground hover:text-org transition-colors"
                        >
                            Añadir una dimensión
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.dimensiones.map((dim) => (
                            <div key={dim.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                                <input
                                    placeholder="Nombre de la dimensión"
                                    value={dim.nombre}
                                    onChange={(e) => updateDimension(dim.id, "nombre", e.target.value)}
                                    className="flex-1 h-10 rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org"
                                />
                                <div className="flex items-center gap-1">
                                    <input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={dim.peso}
                                        onChange={(e) => updateDimension(dim.id, "peso", parseInt(e.target.value) || 0)}
                                        className="w-20 h-10 rounded-md border border-border bg-background px-2 font-body text-center focus:outline-none focus:ring-2 focus:ring-org"
                                    />
                                    <span className="text-sm text-muted-foreground font-medium">%</span>
                                </div>
                                <button
                                    onClick={() => removeDimension(dim.id)}
                                    className="p-2 rounded-md text-muted-foreground hover:text-error hover:bg-error-bg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    onClick={addDimension}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-md text-sm font-heading font-semibold text-foreground hover:border-org hover:text-org transition-colors"
                >
                    <Plus className="w-4 h-4" strokeWidth={2} />
                    Añadir Dimensión
                </button>

                {totalPeso !== 100 && (
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
