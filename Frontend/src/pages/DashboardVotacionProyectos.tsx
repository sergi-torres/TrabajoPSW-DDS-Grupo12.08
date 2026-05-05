import React, { useState, useContext } from 'react';
import ProyectosLista from '../components/votacion/votacionProyectos/ProyectosLista';
import OpcionesSeleccionado from '../components/votacion/votacionProyectos/OpcionesSeleccionado';
import EvaluacionCriterios from '../components/votacion/votacionProyectos/EvaluacionCriterios';
import { useEnviarVoto } from '../hooks/VotacionHooks/useEnvioVoto';
import { useFingerprint } from '../hooks/useFingerprint';
import { enviarDatosVotoBatch } from '../api/votacionApi';
import { AuthContext } from '../context/AuthContext';
import { EventContext } from '../context/EventContext';
import { EventSidebar } from '../components/layout/EventSidebar';
import { cn } from '../components/ui/utils';
import { ArrowLeft, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  categoria: any;
  alVolver: () => void;
  comentariosObligatorios: boolean;
}

const DashboardVotacionProyectos: React.FC<Props> = ({ categoria, alVolver, comentariosObligatorios }) => {
  const { enviarVoto, cargando } = useEnviarVoto();
  const { fingerprint, isLoading: fpLoading } = useFingerprint();
  const { isPublic, isAuthenticated } = useContext(AuthContext)!;
  const { userRole, userColor, isCollapsed, eventoId } = useContext(EventContext)!;
  
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [comentario, setComentario] = useState("");
  const [pasoEvaluacion, setPasoEvaluacion] = useState(false);

  const effectivelyPublic = (!isAuthenticated && isPublic) || userRole === "Público";
  const isJurado = userRole === "Jurado";
  const themeColor = effectivelyPublic ? "#059669" : (userColor || "#2563eb");

  const handleConfirmarPublico = async () => {
    if (!seleccionado) return;

    if (comentariosObligatorios && !comentario.trim()) {
      toast.error("El comentario es obligatorio para evaluar en este evento.");
      return;
    }

    const userIdRaw = localStorage.getItem('userId');
    const idUsuario = userIdRaw ? parseInt(userIdRaw) : null;
    const sessionId = localStorage.getItem('sessionId');
    const storedEventoId = localStorage.getItem('eventoId');
    const finalEventoId = eventoId || (storedEventoId ? parseInt(storedEventoId) : 0);

    const votoDto = {
      eventoId: finalEventoId,
      categoriaId: categoria.id,
      proyectoId: seleccionado.id,
      comentario: comentario,
      idUsuario: (idUsuario !== null && !Number.isNaN(idUsuario)) ? idUsuario : null,
      sessionId: sessionId || null,
      identificadorHash: fingerprint || undefined,
      valor: 1, // Voto público vale 1
      idcriterio: null,
      idproyecto: seleccionado.id,
      idevaluador: idUsuario,
      idcategoria: categoria.id
    };

    await enviarVoto(votoDto as any);
    // Independientemente de si fue éxito o error (ej: "No se ha podido procesar"),
    // volvemos a la pantalla de categorías. El Toast informará al usuario.
    alVolver(); 
  };

  const handleConfirmarJurado = async (evaluaciones: { criterioId: number, valor: number, comentario: string }[], comentarioGlobal: string) => {
    if (!seleccionado) return;

    const userIdRaw = localStorage.getItem('userId');
    const idUsuario = userIdRaw ? parseInt(userIdRaw) : null;
    const storedEventoId = localStorage.getItem('eventoId');
    const finalEventoId = eventoId || (storedEventoId ? parseInt(storedEventoId) : 0);

    try {
      // Enviar todas las evaluaciones en una sola petición batch
      const batchPayload = {
        eventoId: finalEventoId,
        categoriaId: categoria.id,
        proyectoId: seleccionado.id,
        idUsuario: idUsuario,
        comentarioGlobal: comentarioGlobal || undefined,
        evaluaciones: evaluaciones.map(e => ({
          criterioId: e.criterioId,
          valor: e.valor,
          comentario: e.comentario
        }))
      };

      await enviarDatosVotoBatch(batchPayload);
      toast.success("Evaluación completa registrada correctamente");
      alVolver();
    } catch (err) {
      console.error(err);
      toast.error((err as any)?.message || "Error al procesar la evaluación completa");
    }
  };

  const handleExit = () => {
    if (pasoEvaluacion) {
      setPasoEvaluacion(false);
      return;
    }
    if (effectivelyPublic) {
        localStorage.clear();
        window.location.href = "/login";
    } else {
        alVolver();
    }
  };

  const proyectos = categoria?.proyectos || [];

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      {!effectivelyPublic && <EventSidebar />}

      <div className="pb-[88px] lg:pb-0">
        <header 
          className={cn(
            "text-white p-6 lg:p-10 transition-all duration-300",
            effectivelyPublic ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
          )}
          style={{ backgroundColor: themeColor }}
        >
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleExit}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
            >
              {effectivelyPublic && !pasoEvaluacion ? (
                <>
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Salir
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  {pasoEvaluacion ? 'Atrás' : 'Volver'}
                </>
              )}
            </button>

            <h2 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-3">
                {pasoEvaluacion ? 'Evaluación Detallada' : `Vota un proyecto en "${categoria?.nombre || categoria?.titulo || 'Categoría'}"`}
            </h2>
            <p className="text-lg font-medium opacity-90">
                {pasoEvaluacion 
                  ? 'Asigna puntuaciones y comentarios para cada criterio de evaluación.' 
                  : 'Selecciona el proyecto que deseas evaluar de la lista.'
                }
            </p>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-8 space-y-8 transition-all duration-300",
          effectivelyPublic ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
        )}>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-10">
            {pasoEvaluacion ? (
              <EvaluacionCriterios 
                proyecto={seleccionado}
                eventoId={eventoId || 0}
                categoriaId={categoria.id}
                onConfirmar={isJurado ? handleConfirmarJurado : async (evals, global) => {
                    // Adaptar el flujo de público para que use EvaluacionCriterios
                    // pero solo enviando el primer voto o simplificado si el backend espera 1 solo valor.
                    // Para el MVP, si el público ahora usa criterios, enviamos el batch como el jurado
                    // pero con valores de peso 1 o según se configure.
                    await handleConfirmarJurado(evals, global);
                }}
                onCancelar={() => setPasoEvaluacion(false)}
                cargando={cargando}
                comentariosObligatorios={comentariosObligatorios}
                themeColor={themeColor}
              />
            ) : (
              <>
                <ProyectosLista 
                    proyectos={proyectos} 
                    seleccionado={seleccionado} 
                    alSeleccionar={setSeleccionado} 
                />

                {/* Ya no mostramos OpcionesSeleccionado por separado, 
                    el público también irá al paso de evaluación detallada */}

                <div className="flex justify-end gap-4 mt-12">
                    <button
                    onClick={handleExit}
                    disabled={cargando}
                    className="px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                    >
                    {effectivelyPublic ? 'Cancelar' : 'Atrás'}
                    </button>
                    <button
                    onClick={() => setPasoEvaluacion(true)}
                    disabled={!seleccionado || cargando || (categoria.estado !== 'activa' && !isJurado)}
                    className={cn(
                        "px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all",
                        seleccionado && !cargando && (categoria.estado === 'activa' || isJurado)
                            ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                            : 'bg-gray-200 cursor-not-allowed shadow-none'
                    )}
                    style={seleccionado && !cargando && (categoria.estado === 'activa' || isJurado) ? { backgroundColor: themeColor } : {}}
                    >
                    {cargando ? 'Enviando...' : (categoria.estado !== 'activa' && !isJurado ? 'Voto Registrado' : 'Continuar a Evaluación')}
                    </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardVotacionProyectos;
