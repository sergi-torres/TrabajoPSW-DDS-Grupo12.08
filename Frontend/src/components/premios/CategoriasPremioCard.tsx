import React from 'react';
import { Award, DollarSign, Trophy, Medal, Sparkles } from 'lucide-react';
import { Categoria, Premio } from '../../types';

interface Props {
  categoria: Categoria;
  premios?: Premio[];
  onOpenEditor: (categoria: Categoria, posicion: number, premio?: Premio | null) => void;
  onDelete?: (premio: Premio) => void;
}

const CategoriasPremioCard: React.FC<Props> = ({ categoria, premios = [], onOpenEditor, onDelete }) => {
  const posiciones = [1, 2, 3];

  const premioPorPosicion = (posicion: number) => premios.find((premio) => premio.posicion === posicion) ?? null;

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    trofeo: Trophy,
    medalla: Medal,
    dinero: DollarSign,
    award: Award,
    brillo: Sparkles
  };

  return (
    <div className="rounded-lg shadow-base bg-card p-6 flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-semibold">{categoria.nombre}</h3>
        <p className="text-sm text-slate-500 mt-1">Premios por posición</p>
      </div>

      <div className="space-y-3">
        {posiciones.map((posicion) => {
          const premio = premioPorPosicion(posicion);
          const Icon = premio ? iconMap[premio.icono || 'trofeo'] || Trophy : null;
          return (
            <div key={posicion} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`grid h-10 w-10 place-items-center rounded-2xl ${premio ? 'bg-blue-50 text-blue-600' : 'bg-blue-50 text-blue-600'}`}>
                    {Icon && <Icon className="h-5 w-5" />}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">{posicion}ª posición</div>
                    {premio ? (
                      <div className="font-medium text-slate-900 truncate">{premio.nombre}</div>
                    ) : (
                      <div className="text-sm text-blue-700">Sin premio</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    className={premio ? 'inline-flex items-center justify-center min-w-[120px] rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50' : 'inline-flex items-center justify-center min-w-[120px] rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700'}
                    onClick={() => onOpenEditor(categoria, posicion, premio)}
                  >
                    {premio ? 'Editar Premio' : '+ Asignar Premio'}
                  </button>
                  {premio && onDelete && (
                    <button
                      onClick={() => onDelete(premio)}
                      className="inline-flex items-center justify-center min-w-[120px] rounded-3xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriasPremioCard;
