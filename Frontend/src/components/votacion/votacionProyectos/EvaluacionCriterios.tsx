import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Target
} from 'lucide-react';
import { cn } from '../../ui/utils';

interface Criterio {
  id: number;
  nombre: string;
  peso: number;
  tipoCriterio: string;
  comentarioObligatorio: boolean;
}

interface Props {
  proyecto: any;
  eventoId: number;
  categoriaId: number;
  onConfirmar: (evaluaciones: { criterioId: number, valor: number, comentario: string }[]) => void;
  onCancelar: () => void;
  cargando?: boolean;
}

const EvaluacionCriterios: React.FC<Props> = ({ 
  proyecto, 
  eventoId, 
  categoriaId, 
  onConfirmar, 
  onCancelar,
  cargando 
}) => {
  const [criterios, setCriterios] = useState<Criterio[]>([]);
  const [evaluaciones, setEvaluaciones] = useState<Record<number, { valor: number, comentario: string }>>({});
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCriterios = async () => {
      try {
        setFetching(true);
        const response = await fetch(`http://localhost:5245/api/Eventos/${eventoId}`);
        if (!response.ok) throw new Error('Error al cargar criterios');
        
        const data = await response.json();
        // Extraer todos los criterios de todos los baremos
        const allCriterios: Criterio[] = data.baremos.flatMap((b: any) => b.criterios);
        setCriterios(allCriterios);
        
        // Inicializar evaluaciones
        const initialEval: Record<number, { valor: number, comentario: string }> = {};
        allCriterios.forEach(c => {
          initialEval[c.id] = { valor: 5, comentario: "" };
        });
        setEvaluaciones(initialEval);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los criterios de evaluación.");
      } finally {
        setFetching(false);
      }
    };

    fetchCriterios();
  }, [eventoId]);

  const handleUpdate = (criterioId: number, field: 'valor' | 'comentario', value: any) => {
    setEvaluaciones(prev => ({
      ...prev,
      [criterioId]: { ...prev[criterioId], [field]: value }
    }));
  };

  const handleConfirmar = () => {
    // Validar comentarios obligatorios
    const faltanComentarios = criterios.some(c => 
      c.comentarioObligatorio && !evaluaciones[c.id].comentario.trim()
    );

    if (faltanComentarios) {
      import('sonner').then(m => m.toast.error("Algunos criterios requieren un comentario obligatorio."));
      return;
    }

    const payload = criterios.map(c => ({
      criterioId: c.id,
      valor: evaluaciones[c.id].valor,
      comentario: evaluaciones[c.id].comentario
    }));

    onConfirmar(payload);
  };

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Cargando criterios de evaluación...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-900 font-bold mb-2">{error}</p>
        <button onClick={onCancelar} className="text-red-600 font-semibold hover:underline">Volver</button>
      </div>
    );
  }

  if (!fetching && criterios.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-12 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No hay criterios definidos</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-8">
          Este evento aún no tiene configurado un baremo de evaluación. Por favor, contacta con el organizador.
        </p>
        <button 
          onClick={onCancelar}
          className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-100 transition-all shadow-sm"
        >
          Volver a la lista
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-2xl font-heading font-bold text-gray-900">
            Evaluando: <span className="text-blue-600">{proyecto.nombre}</span>
          </h3>
          <p className="text-gray-500 text-sm">Proporciona una calificación y feedback para cada criterio.</p>
        </div>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {criterios.map((c, index) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-100 rounded-[32px] p-6 lg:p-8 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                {/* Info Criterio */}
                <div className="lg:w-1/3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                      Peso: {c.peso}%
                    </span>
                    {c.comentarioObligatorio && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Requerido
                      </span>
                    )}
                  </div>
                  <h4 className="text-xl font-heading font-bold text-gray-900 mb-2">{c.nombre}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Evalúa este aspecto del proyecto en una escala del 1 al 10.
                  </p>
                </div>

                {/* Controles de Evaluación */}
                <div className="flex-1 space-y-6">
                  {/* Calificación Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider">Calificación</span>
                      <span className="text-2xl font-heading font-black text-blue-600">{evaluaciones[c.id].valor}</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={evaluaciones[c.id].valor}
                      onChange={(e) => handleUpdate(c.id, 'valor', parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                      <span>Deficiente</span>
                      <span>Excelente</span>
                    </div>
                  </div>

                  {/* Comentario */}
                  <div className="relative">
                    <div className="absolute left-4 top-4 text-gray-400">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <textarea 
                      placeholder={c.comentarioObligatorio ? "Añade un comentario obligatorio..." : "Comentario opcional..."}
                      value={evaluaciones[c.id].comentario}
                      onChange={(e) => handleUpdate(c.id, 'comentario', e.target.value)}
                      className={cn(
                        "w-full bg-gray-50 border-2 border-transparent rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all resize-none h-24",
                        c.comentarioObligatorio && !evaluaciones[c.id].comentario.trim() && "border-amber-100 bg-amber-50/30"
                      )}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex justify-end gap-4 pt-8">
        <button
          onClick={onCancelar}
          className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmar}
          disabled={cargando}
          className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 hover:shadow-blue-200 transition-all flex items-center gap-2"
        >
          {cargando ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              Confirmar Evaluación Completa
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default EvaluacionCriterios;
