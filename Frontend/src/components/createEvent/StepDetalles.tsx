import { useState, ChangeEvent } from "react";
import { Upload } from "lucide-react";

interface StepDetallesProps {
    data: {
        nombre: string;
        descripcion: string;
        fechaInicio: string;
        fechaFin: string;
        imagen: File | null;
    };
    onChange: (newData: any) => void;
}

const StepDetalles = ({ data, onChange }: StepDetallesProps) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onChange({ ...data, imagen: file });
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-xl font-heading font-semibold text-foreground">Información Básica</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Configura los detalles principales de tu evento competitivo.
                </p>
            </div>

            <div className="space-y-4">
                <div>
                    <label htmlFor="nombre" className="text-sm font-medium text-muted-foreground">
                        Nombre del evento <span className="text-error">*</span>
                    </label>
                    <input
                        id="nombre"
                        placeholder="Ej. Hackathon Anual 2024"
                        value={data.nombre}
                        onChange={(e) => onChange({ ...data, nombre: e.target.value })}
                        className="mt-2 h-12 w-full rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org focus:border-org"
                    />
                </div>

                <div>
                    <label htmlFor="descripcion" className="text-sm font-medium text-muted-foreground">
                        Descripción
                    </label>
                    <textarea
                        id="descripcion"
                        placeholder="Describe brevemente el propósito del evento..."
                        value={data.descripcion}
                        onChange={(e) => onChange({ ...data, descripcion: e.target.value })}
                        className="mt-2 min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 font-body focus:outline-none focus:ring-2 focus:ring-org focus:border-org resize-none"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="fechaInicio" className="text-sm font-medium text-muted-foreground">
                            Fecha y hora de inicio <span className="text-error">*</span>
                        </label>
                        <input
                            id="fechaInicio"
                            type="datetime-local"
                            max="9999-12-31T23:59"
                            value={data.fechaInicio}
                            onChange={(e) => onChange({ ...data, fechaInicio: e.target.value })}
                            className="mt-2 h-12 w-full rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org focus:border-org"
                        />
                    </div>
                    <div>
                        <label htmlFor="fechaFin" className="text-sm font-medium text-muted-foreground">
                            Fecha y hora de fin <span className="text-error">*</span>
                        </label>
                        <input
                            id="fechaFin"
                            type="datetime-local"
                            max="9999-12-31T23:59"
                            value={data.fechaFin}
                            onChange={(e) => onChange({ ...data, fechaFin: e.target.value })}
                            className="mt-2 h-12 w-full rounded-md border border-border bg-background px-3 font-body focus:outline-none focus:ring-2 focus:ring-org focus:border-org"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-sm font-medium text-muted-foreground">Imagen de portada</label>
                    <label
                        htmlFor="imagen-upload"
                        className="mt-2 flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-md cursor-pointer hover:border-org hover:bg-org/5 transition-all duration-[var(--duration-fast)]"
                    >
                        {imagePreview ? (
                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover rounded-md" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Upload className="w-8 h-8" strokeWidth={1.75} />
                                <span className="text-sm font-medium">Haz clic para subir imagen</span>
                                <span className="text-xs">PNG, JPG (Max. 5MB)</span>
                            </div>
                        )}
                        <input
                            id="imagen-upload"
                            type="file"
                            accept="image/png,image/jpeg"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default StepDetalles;
