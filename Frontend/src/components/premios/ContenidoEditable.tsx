import { useEffect, useState } from "react";
import { X, Trophy } from "lucide-react";
import IconsBar from "./IconsBar";
import { Categoria, CrearPremioRequest, Premio } from "../../types";

interface Props {
  isOpen: boolean;
  categoria?: Categoria | null;
  premios?: Premio[];
  initialPosition?: number;
  onClose: () => void;
  onSave: (premioDto: CrearPremioRequest, premioId?: number) => void;
}

const ContenidoEditable: React.FC<Props> = ({ isOpen, categoria, premios = [], initialPosition = 1, onClose, onSave }) => {
  const [activePosition, setActivePosition] = useState<number>(initialPosition);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [icono, setIcono] = useState("trofeo");

  const currentPremio = premios.find((premio) => premio.posicion === activePosition) || null;

  useEffect(() => {
    setActivePosition(initialPosition);
  }, [initialPosition, categoria]);

  useEffect(() => {
    setNombre(currentPremio?.nombre || "");
    setDescripcion(currentPremio?.descripcion || "");
    setIcono(currentPremio?.icono || "trofeo");
  }, [currentPremio, categoria, activePosition]);

  const isValid = nombre.trim().length > 0;

  if (!isOpen || !categoria) return null;

  const handleSave = () => {
    onSave(
      {
        idCategoria: categoria.id,
        nombre,
        descripcion,
        posicion: activePosition,
        icono
      },
      currentPremio?.id
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-[32px] bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden">
        <div className="flex items-center justify-between gap-4 bg-blue-600 px-6 py-5 text-white">
          <div>
            <div className="flex items-center gap-3 font-semibold text-lg">
              <Trophy className="h-6 w-6" />
              <span>Gestión de Premios</span>
            </div>
            <p className="text-sm text-blue-100/90 mt-1">Define los premios de la categoría por posición.</p>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-8 px-6 py-8">
          <div>
            <p className="text-sm font-semibold text-slate-800">Icono</p>
            <p className="mt-2 text-slate-600">Selecciona un ícono que represente este premio.</p>
          </div>

          <IconsBar selectedIcon={icono} onSelect={setIcono} />

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">
                Nombre del Premio
                <span className="text-rose-600 ml-1" title="Obligatorio">*</span>
                <span className="text-xs text-rose-600 ml-2">(obligatorio)</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
                placeholder="Ej: Mejor Innovación"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              className="w-full rounded-[32px] border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
              placeholder="Describe el criterio o logro que reconoce este premio"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-3xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className={`rounded-3xl px-6 py-3 text-sm font-semibold text-white transition ${isValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              Guardar Premio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContenidoEditable;
