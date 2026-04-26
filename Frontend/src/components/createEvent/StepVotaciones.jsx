import { Users, Scale, MessageSquare } from "lucide-react";
import { useState } from "react";

const maxCategorias = 10; // Definimos un máximo de categorías

const ParentComponent = () => {
  const [formData, setFormData] = useState({
    pesoJurado: 50,
    votoPublicoHabilitado: true,
    categorias: [],
    comentariosObligatorios: false
    
  });

  return (
    <StepVotaciones
      data={formData}
      onChange={setFormData}
    />
  );

};



const StepVotaciones = ({ data, onChange }) => {

    const { categorias = []} = data;

    const pesoPublico = 100 - data.pesoJurado;

    const handleUpdateCategories = (newCats) => {
        onChange({
            ...data,       
            categorias: newCats
        });
    };

    const handleWeightChange = (newWeight) => {
        onChange({
            ...data,
            pesoJurado: newWeight
        });
    };

    //console.log("Datos actuales de votación:", data);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-heading font-semibold text-foreground">Configuración de Votación</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Define cómo se calcularán los resultados finales.
                </p>
            </div>

            <div className="rounded-lg shadow-base bg-card p-6 space-y-6">
                <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-org mt-0.5" strokeWidth={1.75} />
                    <div>
                        <h4 className="text-base font-heading font-semibold text-foreground">Categorías de Votantes</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                            Existen dos tipos de votantes: el <strong>Jurado</strong> (expertos designados) y el{" "}
                            <strong>Público</strong> (audiencia general).
                        </p>
                    </div>
                </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-org/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-org" strokeWidth={1.75} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Voto del Público</label>
                            <p className="text-xs text-muted-foreground">
                                {data.votoPublicoHabilitado ? "Habilitado" : "Deshabilitado"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={data.votoPublicoHabilitado}
                        onClick={() => onChange({ ...data, votoPublicoHabilitado: !data.votoPublicoHabilitado })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.votoPublicoHabilitado ? 'bg-org' : 'bg-muted'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.votoPublicoHabilitado ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Scale className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
                            <span className="text-sm font-medium text-foreground">Peso del Jurado</span>
                        </div>
                        <span className="text-lg font-heading font-bold text-org">
                            {data.pesoJurado}%
                        </span>
                    </div>
                    <input
                        type="range"
                        value={data.pesoJurado}
                        onChange={(e) => onChange({ ...data, pesoJurado: parseInt(e.target.value) })}
                        min={0}
                        max={100}
                        step={5}
                        disabled={!data.votoPublicoHabilitado}
                        className="w-full accent-org"
                    />
                </div>

                {data.votoPublicoHabilitado && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-muted-foreground" strokeWidth={1.75} />
                                <span className="text-sm font-medium text-foreground">Peso del Público</span>
                            </div>
                            <span className="text-lg font-heading font-bold text-success">
                                {pesoPublico}%
                            </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                            <div
                                className="h-full bg-success rounded-full transition-all duration-[var(--duration-normal)]"
                                style={{ width: `${pesoPublico}%` }}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">Calculado automáticamente</p>
                    </div>
                )}

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
                            <MessageSquare className="w-5 h-5 text-info" strokeWidth={1.75} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Comentarios Obligatorios</label>
                            <p className="text-xs text-muted-foreground">
                                {data.comentariosObligatorios ? "Los votantes deberán dejar un comentario" : "Los comentarios son opcionales"}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={data.comentariosObligatorios}
                        onClick={() => onChange({ ...data, comentariosObligatorios: !data.comentariosObligatorios })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.comentariosObligatorios ? 'bg-info' : 'bg-muted'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.comentariosObligatorios ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>
            </div>

            {/*Categorías, concretamente, botón de añadir, y hasta un máximo de 5*/}

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-base font-heading font-semibold text-foreground">
                        Categorías del evento
                    </h4>
                    <button
                        type="button"
                        onClick={() => {
                            if ((data.categorias?.length || 0) >= maxCategorias) return;
                                onChange({
                                ...data,
                                categorias: [...(data.categorias || []), ""],
                                });
                                        
                                }}
                            className="text-sm px-3 py-1 rounded-lg bg-org text-white hover:opacity-90 disabled:opacity-50"
                            disabled={(data.categorias?.length || 0) >= maxCategorias}
                            >
                        + Añadir
                    </button>
            </div>

            {/*Categorías, texto de los contenedores y botón de eliminar*/}

            <div className="space-y-2">
                {(data.categorias || []).map((cat, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input
                        type="text"
                        value={cat}
                        onChange={(e) => {
                            const nuevas = [...data.categorias];
                            nuevas[index] = e.target.value;
                            onChange({ ...data, categorias: nuevas });
                        }}
                        placeholder={`Categoría ${index + 1}`}
                        className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm"
                    />

                <button
                    type="button"
                    onClick={() => {
                        const nuevas = data.categorias.filter((_, i) => i !== index);
                        onChange({ ...data, categorias: nuevas });
                        }}
                    className="px-2 py-1 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200"
                    >
                        ✕
                    </button>
                </div>
                ))}
            </div>

                     <p className="text-xs text-muted-foreground">
                            Puedes añadir hasta {maxCategorias} categorías
                    </p>

            </div>

        </div>
    );
};

export default StepVotaciones;
