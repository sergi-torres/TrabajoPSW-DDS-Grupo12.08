import { Users, Scale } from "lucide-react";

const StepVotaciones = ({ data, onChange }) => {
    const pesoPublico = 100 - data.pesoJurado;

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
            </div>
        </div>
    );
};

export default StepVotaciones;
