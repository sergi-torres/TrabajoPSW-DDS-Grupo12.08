import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { EventSidebar } from "../components/layout/EventSidebar";
import { MobileNav } from "../components/eventos/MobileNav";
import { 
  ArrowLeft, 
  Target, 
  Award, 
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { categoriasApi } from "../api/categoriasApi";
import { comentariosApi } from "../api/comentariosApi";
import { deleteProyecto, getProyectosByParticipante } from "../api/proyectoApi";
import { ProyectoFeedbackCard } from "../components/feedback/ProyectoFeedbackCard";

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function VotosPage() {
  const { eventoId: eventoIdParam } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { userColor, isCollapsed, userRole } = useContext(EventContext)!;

  const userId = authCtx?.userId;
  const userName = authCtx?.userName;

  const [categoria, setCategoria] = useState<any>(null);
  const [comentariosJuradoCount, setComentariosJuradoCount] = useState(0);
  const [comentariosPublicoCount, setComentariosPublicoCount] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [proyectosDisponibles, setProyectosDisponibles] = useState<any[]>([]);
  const [proyectoActual, setProyectoActual] = useState<any>(null);

  const isPublicRole = userRole === "Público";
  const themeColor = userColor || "#9333ea";

  const eventoId = eventoIdParam ? Number(eventoIdParam) : null;

  // Cargar lista de proyectos
  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        if (!userId || !eventoId) {
          // Fallback a localStorage si no hay contexto (aunque debería haberlo por la ruta)
          const storedProyectos = localStorage.getItem("proyectos");
          if (storedProyectos) {
            const proyectos = JSON.parse(storedProyectos);
            setProyectosDisponibles(proyectos);
            
            const currentId = localStorage.getItem("proyectoId");
            if (currentId) {
              const found = proyectos.find((p: any) => p.id == currentId);
              setProyectoActual(found || proyectos[0]);
            } else {
              setProyectoActual(proyectos[0]);
            }
          } else {
            // Si no hay nada, dejamos de cargar
            setCargando(false);
          }
          return;
        }

        const todos = await getProyectosByParticipante(userId);
        const delEvento = todos.filter((p: any) => {
          const pidEvento = p.idevento ?? p.idEvento;
          return Number(pidEvento) === Number(eventoId);
        });

        setProyectosDisponibles(delEvento);

        if (delEvento.length > 0) {
          const currentId = localStorage.getItem("proyectoId");
          const found = delEvento.find((p: any) => p.id == currentId);
          setProyectoActual(found || delEvento[0]);
        } else {
          setCargando(false);
        }
      } catch (err) {
        console.error("Error cargando proyectos del participante:", err);
        setCargando(false);
      }
    };

    cargarProyectos();
  }, [userId, eventoId]);

  // FETCH DE COMENTARIOS Y VOTACIONES CUANDO CAMBIA EL PROYECTO ACTUAL
  useEffect(() => {
    if (proyectoActual) {
      fetchData(proyectoActual.id.toString());
      
      // Sincronizar localStorage para compatibilidad con otros componentes si es necesario
      localStorage.setItem("proyectoId", proyectoActual.id.toString());
      localStorage.setItem("proyectoNombre", proyectoActual.nombre);
      localStorage.setItem("proyectoDescripcion", proyectoActual.descripcion || "");
      if (proyectoActual.idcategoria || proyectoActual.idCategoria) {
        localStorage.setItem("categoriaProyecto", (proyectoActual.idcategoria || proyectoActual.idCategoria).toString());
      }
    }
  }, [proyectoActual]);

  const fetchData = async (proyectoId: string) => {
    try {
      // 1. Obtener resumen de comentarios
      const catIdRaw = proyectoActual?.idcategoria ?? proyectoActual?.idCategoria ?? localStorage.getItem("categoriaProyecto");
      if (catIdRaw) {
        const catId = Number(catIdRaw);
        const proyId = Number(proyectoId);

        try {
          const resumen = await comentariosApi.getResumen(proyId, catId);
          const grupoJurado = resumen.find((g: any) => g.tipo === "Jurado");
          const grupoPublico = resumen.find((g: any) => g.tipo === "Público");

          setComentariosJuradoCount(grupoJurado?.totalComentarios || 0);
          setComentariosPublicoCount(grupoPublico?.totalComentarios || 0);
        } catch (err) {
          console.warn("Error al cargar resumen de comentarios:", err);
          setComentariosJuradoCount(0);
          setComentariosPublicoCount(0);
        }

        // 2. Obtener categoría
        try {
          const catData = await categoriasApi.getById(catId);
          setCategoria(catData);
        } catch (err) {
          console.warn("Error al cargar categoría:", err);
        }
      }
    } catch (err) {
      console.error("Error cargando datos de feedback:", err);
    } finally {
      setCargando(false);
    }
  };

  // Navegar a proyecto anterior
  const goToPreviousProject = () => {
    if (!proyectosDisponibles.length || !proyectoActual) return;
    const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActual.id);
    if (currentIndex > 0) {
      setProyectoActual(proyectosDisponibles[currentIndex - 1]);
    } else {
      alert("No hay proyecto anterior");
    }
  };

  // Navegar a proyecto siguiente
  const goToNextProject = () => {
    if (!proyectosDisponibles.length || !proyectoActual) return;
    const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActual.id);
    if (currentIndex < proyectosDisponibles.length - 1) {
      setProyectoActual(proyectosDisponibles[currentIndex + 1]);
    } else {
      alert("No hay proyecto siguiente");
    }
  };

  // Eliminar proyecto actual
  const deleteProject = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este proyecto?\n\nEsta acción no se puede deshacer."
    );
    if (!confirmDelete || !proyectoActual) return;

    try {
      const success = await deleteProyecto(proyectoActual.id);

      if (success) {
        // Actualizar lista local
        const nuevosProyectos = proyectosDisponibles.filter(p => p.id != proyectoActual.id);
        setProyectosDisponibles(nuevosProyectos);
        
        // Limpiar datos del proyecto actual en localStorage
        localStorage.removeItem("proyectoId");
        localStorage.removeItem("proyectoNombre");
        localStorage.removeItem("proyectoDescripcion");
        localStorage.removeItem("categoriaProyecto");

        if (nuevosProyectos.length > 0) {
          setProyectoActual(nuevosProyectos[0]);
        } else {
          navigate("/eventos");
        }
        
        alert("Proyecto eliminado exitosamente");
      }
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      alert("Error al eliminar el proyecto");
    }
  };

  const currentIndex = proyectoActual ? proyectosDisponibles.findIndex(p => p.id == proyectoActual.id) : -1;
  const state = {
    participantName: userName || localStorage.getItem("userName") || "Usuario",
    projectName: localStorage.getItem("eventoNombre") || "Evento",
  };

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando proyecto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      {!isPublicRole && <EventSidebar />}
      <MobileNav />

      <div className="pb-[88px] lg:pb-12">
        <header
          className={cn(
            "text-white p-6 lg:p-10 transition-all duration-300",
            isPublicRole ? "lg:pl-10" : (isCollapsed ? "lg:pl-28" : "lg:pl-80")
          )}
          style={{ backgroundColor: themeColor }}
        >
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/eventos")}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
              Volver a eventos
            </button>

            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                {state.projectName}
              </h1>
              <p className="opacity-90 text-lg font-medium">
                Bienvenido de nuevo, {state.participantName}
              </p>
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-8 transition-all duration-300",
          isPublicRole ? "" : (isCollapsed ? "lg:pl-28" : "lg:pl-80")
        )}>
          {/* PROYECTO Y RESUMEN */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <article className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                    <Target className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">Sobre tu Proyecto</h2>
                </div>
                
                {/* Botones de navegación */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPreviousProject}
                    disabled={proyectosDisponibles.length <= 1 || currentIndex <= 0}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </button>
                  
                  <button
                    onClick={goToNextProject}
                    disabled={proyectosDisponibles.length <= 1 || currentIndex >= proyectosDisponibles.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={deleteProject}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Borrar
                  </button>
                </div>
              </div>

              {/* Indicador de progreso */}
              {proyectosDisponibles.length > 0 && (
                <div className="mb-4 text-sm text-gray-500">
                  Proyecto {currentIndex + 1} de {proyectosDisponibles.length}
                </div>
              )}

              <div className="flex flex-col space-y-3 mb-4">
                <p className="text-xl font-heading font-bold text-gray-900">
                  <span style={{ color: themeColor }}>Nombre:</span> {proyectoActual?.nombre || "Sin nombre"}
                </p>
                <p className="text-xl font-heading font-bold text-gray-900">
                  <span className="text-blue-600">Categoría:</span> {categoria?.nombre || "Global"}
                </p>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                <span>Descripción:</span> {proyectoActual?.descripcion || "Sin descripción disponible para este proyecto."}
              </p>
            </article>

            <article className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">Reconocimiento</h2>
              <p className="text-gray-500 mb-6">Tu proyecto se encuentra entre los más destacados del evento.</p>
              <span className="px-4 py-2 text-white font-bold rounded-full text-sm shadow-lg" style={{ backgroundColor: themeColor }}>
                Top 10% del Evento
              </span>
            </article>
          </section>

          {/* FEEDBACK Y SÍNTESIS IA */}
          <ProyectoFeedbackCard
            idProyecto={proyectoActual?.id || 0}
            nombreProyecto={proyectoActual?.nombre || "Sin nombre"}
            idCategoria={categoria?.id || 0}
            nombreCategoria={categoria?.nombre || "Global"}
            estadoCategoria={categoria?.estado ?? categoria?.Estado ?? "Pendiente"}
            comentariosJuradoCount={comentariosJuradoCount}
            comentariosPublicoCount={comentariosPublicoCount}
          />
        </main>
      </div>
    </div>
  );
}
