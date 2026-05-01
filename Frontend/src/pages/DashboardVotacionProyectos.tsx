import React, { useState, useContext } from 'react';
import ProyectosLista from '../components/votacion/votacionProyectos/ProyectosLista';
import OpcionesSeleccionado from '../components/votacion/votacionProyectos/OpcionesSeleccionado';
import { useEnviarVoto } from '../hooks/VotacionHooks/useEnvioVoto';
import { AuthContext } from '../context/AuthContext';
import { EventContext } from '../context/EventContext';
import { EventSidebar } from '../components/layout/EventSidebar';
import { cn } from '../components/ui/utils';
import { ArrowLeft, LogOut } from 'lucide-react';

interface Props {
  categoria: any;
  alVolver: () => void;
  comentariosObligatorios: boolean;
}

const DashboardVotacionProyectos: React.FC<Props> = ({ categoria, alVolver, comentariosObligatorios }) => {
  const { enviarVoto, cargando } = useEnviarVoto();
  const { isPublic, isAuthenticated } = useContext(AuthContext)!;
  const { userRole, userColor, isCollapsed } = useContext(EventContext)!;
  
  const [seleccionado, setSeleccionado] = useState<any>(null);
  const [comentario, setComentario] = useState("");

  const effectivelyPublic = (!isAuthenticated && isPublic) || userRole === "Público";
  const themeColor = effectivelyPublic ? "#059669" : (userColor || "#2563eb");

  const handleConfirmar = async () => {
    if (!seleccionado) return;

    if (comentariosObligatorios && !comentario.trim()) {
      import('sonner').then(module => {
         module.toast.error("El comentario es obligatorio para evaluar en este evento.");
      });
      return;
    }

    const eventoIdRaw = localStorage.getItem('eventoId');
    const eventoId = eventoIdRaw ? parseInt(eventoIdRaw) : 0;
    const userIdRaw = localStorage.getItem('userId');
    const idUsuario = userIdRaw ? parseInt(userIdRaw) : null;
    const sessionId = localStorage.getItem('sessionId');

    const votoDto = {
      eventoId: eventoId,
      categoriaId: categoria.id,
      proyectoId: seleccionado.id,
      comentario: comentario,
      idUsuario: (idUsuario !== null && !Number.isNaN(idUsuario)) ? idUsuario : null,
      sessionId: sessionId || null,
      valor: 0,
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

  const handleExit = () => {
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
              {effectivelyPublic ? (
                <>
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Salir
                </>
              ) : (
                <>
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  Volver
                </>
              )}
            </button>

            <h2 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-3">
                Vota un proyecto en "{categoria?.nombre || categoria?.titulo || 'Categoría'}"
            </h2>
            <p className="text-lg font-medium opacity-90">
                Selecciona el proyecto que más te guste de la lista. Tu opinión es importante para nosotros.
            </p>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-8 space-y-8 transition-all duration-300",
          effectivelyPublic ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
        )}>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-10">
            <ProyectosLista 
                proyectos={proyectos} 
                seleccionado={seleccionado} 
                alSeleccionar={setSeleccionado} 
            />

            <OpcionesSeleccionado
                seleccionado={seleccionado}
                comentario={comentario}
                setComentario={setComentario}
                comentariosObligatorios={comentariosObligatorios}
            />

            <div className="flex justify-end gap-4 mt-12">
                <button
                onClick={handleExit}
                disabled={cargando}
                className="px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                {effectivelyPublic ? 'Cancelar' : 'Atrás'}
                </button>
                <button
                onClick={handleConfirmar}
                disabled={!seleccionado || cargando}
                className={cn(
                    "px-10 py-4 rounded-2xl font-bold text-white shadow-lg transition-all",
                    seleccionado && !cargando
                        ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                        : 'bg-gray-200 cursor-not-allowed shadow-none'
                )}
                style={seleccionado && !cargando ? { backgroundColor: themeColor } : {}}
                >
                {cargando ? 'Enviando...' : 'Confirmar Voto'}
                </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardVotacionProyectos;
