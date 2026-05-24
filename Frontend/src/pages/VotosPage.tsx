import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { EventSidebar } from "../components/layout/EventSidebar";
import { useVoting } from "../context/VotingContext";
import { comentariosApi } from "../api/comentariosApi";
import { deleteProyecto } from "../api/proyectoApi";
import { 
  ArrowLeft, 
  Target, 
  Award, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
  ThumbsUp
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import ProyectoFeedbackCard from "../components/feedback/ProyectoFeedbackCard";
import { ConfirmModal } from "../components/layout/ConfirmModal";

// ============================================
// SUB-COMPONENTES
// ============================================

const CriterionBar = ({ name, score, maxScore, color }: { name: string; score: number; maxScore: number; color: string }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="font-medium">{name}</span>
      <span style={{ color }}>{score} / {maxScore}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${(score / maxScore) * 100}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

const CommentCard = ({ author, comment, timestamp, likes }: { author: string; comment: string; timestamp: string; likes: number }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium">{author}</h4>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <p className="text-gray-700 text-sm mb-2">{comment}</p>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <ThumbsUp className="w-3 h-3" />
          <span>{likes} personas útil</span>
        </div>
      </div>
    </div>
  </div>
);

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function VotosPage() {
  const { eventoId: eventoIdParam } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();
  const authCtx = useContext(AuthContext);
  const { userColor, isCollapsed, userRole } = useContext(EventContext)!;
  const { addNotification } = useVoting();

  const [votaciones, setVotaciones] = useState<any[]>([]);
  const [categoria, setCategoria] = useState<any>(null);
  const [comentariosJuradoCount, setComentariosJuradoCount] = useState(0);
  const [comentariosPublicoCount, setComentariosPublicoCount] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [proyectosDisponibles, setProyectosDisponibles] = useState<any[]>([]);
  const [proyectoActual, setProyectoActual] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);

  const isPublicRole = userRole === "Público";
  const themeColor = userColor || "#9333ea";
  const userName = authCtx?.userName || localStorage.getItem("userName") || "Usuario";

  // Obtener categoría
  const obtenerCategoria = async () => {
    const idCategoria = localStorage.getItem("categoriaProyecto");
    if (idCategoria) {
      try {
        const catRes = await fetch(`${API_BASE_URL}/api/categorias/id/${idCategoria}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategoria(catData);
          localStorage.setItem("categoriaNombre", catData.nombre);
        }
      } catch (error) {
        console.error("Error obteniendo categoría:", error);
      }
    }
  };

  // Cargar datos del proyecto
  const fetchData = async (proyectoId: string) => {
    if (!proyectoId) return;
    
    try {
      // Obtener resumen de comentarios
      const catIdRaw = proyectoActual?.idCategoria || localStorage.getItem("categoriaProyecto");
      if (catIdRaw && proyectoId) {
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
      }
    } catch (err) {
      toast.error("Error al cargar datos del proyecto");
    } finally {
      setCargando(false);
    }
  };

  // Cargar lista de proyectos desde localStorage
  useEffect(() => {
    const storedProyectos = localStorage.getItem("proyectos");
    if (storedProyectos) {
      const proyectos = JSON.parse(storedProyectos);
      setProyectosDisponibles(proyectos);
      
      const currentId = localStorage.getItem("proyectoId");
      const current = proyectos.find((p: any) => p.id == currentId);
      if (current) {
        setProyectoActual(current);
      } else if (proyectos.length > 0) {
        setProyectoActual(proyectos[0]);
      }
    }
  }, []);

  // Cargar datos cuando proyectoActual cambia
  useEffect(() => {
    if (proyectoActual?.id) {
      fetchData(proyectoActual.id);
      obtenerCategoria();
    }
  }, [proyectoActual]);

  // Navegar a proyecto anterior
  const goToPreviousProject = () => {
    if (!proyectosDisponibles.length || !proyectoActual) return;
    const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActual.id);
    if (currentIndex > 0) {
      const prevProject = proyectosDisponibles[currentIndex - 1];
      localStorage.setItem("proyectoId", prevProject.id);
      localStorage.setItem("proyectoNombre", prevProject.nombre);
      localStorage.setItem("proyectoDescripcion", prevProject.descripcion);
      localStorage.setItem("categoriaProyecto", prevProject.idCategoria);
      setProyectoActual(prevProject);
    } else {
      toast.error("No hay proyecto anterior");
    }
  };

  // Navegar a proyecto siguiente
  const goToNextProject = () => {
    if (!proyectosDisponibles.length || !proyectoActual) return;
    const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActual.id);
    if (currentIndex < proyectosDisponibles.length - 1) {
      const nextProject = proyectosDisponibles[currentIndex + 1];
      localStorage.setItem("proyectoId", nextProject.id);
      localStorage.setItem("proyectoNombre", nextProject.nombre);
      localStorage.setItem("proyectoDescripcion", nextProject.descripcion);
      localStorage.setItem("categoriaProyecto", nextProject.idCategoria);
      setProyectoActual(nextProject);
    } else {
      toast.error("No hay proyecto siguiente");
    }
  };

  // Eliminar proyecto actual
  const confirmDeleteProject = () => {
    if (!proyectoActual) return;
    setProjectToDelete(proyectoActual);
    setIsDeleteModalOpen(true);
  };

  const deleteProject = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);

    try {
      const success = await deleteProyecto(projectToDelete.id);

      if (success) {
        const nuevosProyectos = proyectosDisponibles.filter(p => p.id != projectToDelete.id);
        setProyectosDisponibles(nuevosProyectos);
        
        addNotification("project_deleted", `Proyecto ${projectToDelete.nombre} eliminado correctamente`);

        localStorage.removeItem("proyectoId");
        localStorage.removeItem("proyectoNombre");
        localStorage.removeItem("proyectoDescripcion");
        localStorage.removeItem("categoriaProyecto");
        localStorage.removeItem("categoriaNombre");

        if (nuevosProyectos.length > 0) {
          setProyectoActual(nuevosProyectos[0]);
        } else {
          navigate("/eventos");
        }
        
        setIsDeleteModalOpen(false);
        setProjectToDelete(null);
        toast.success("Proyecto eliminado exitosamente");
      }
    } catch (error) {
      console.error("Error al eliminar proyecto:", error);
      toast.error("Error al eliminar el proyecto");
    } finally {
      setIsDeletingProject(false);
    }
  };

  const currentIndex = proyectoActual ? proyectosDisponibles.findIndex(p => p.id == proyectoActual.id) : -1;
  
  const EVALUATION_CRITERIA = [
    { name: "Innovación", score: 85, maxScore: 100 },
    { name: "Diseño", score: 92, maxScore: 100 },
    { name: "Funcionalidad", score: 78, maxScore: 100 },
    { name: "Presentación", score: 88, maxScore: 100 }
  ];

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
                {localStorage.getItem("eventoNombre") || "Evento"}
              </h1>
              <p className="opacity-90 text-lg font-medium">
                Bienvenido de nuevo, {userName}
              </p>
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-8 transition-all duration-300",
          isPublicRole ? "" : (isCollapsed ? "lg:pl-28" : "lg:pl-80")
        )}>
          {/* PROYECTO Y RESUMEN */}
          <section className="grid grid-cols-1 gap-8">
            <article className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                    <Target className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">Sobre tu Proyecto</h2>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={goToPreviousProject}
                    disabled={proyectosDisponibles.length <= 1 || currentIndex <= 0}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>

                  <button
                    onClick={goToNextProject}
                    disabled={proyectosDisponibles.length <= 1 || currentIndex >= proyectosDisponibles.length - 1}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={confirmDeleteProject}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Borrar</span>
                  </button>
                </div>
              </div>

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
                  <span className="text-blue-600">Categoría:</span> {localStorage.getItem("categoriaNombre") || "Global"}
                </p>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                <span>Descripción:</span> {proyectoActual?.descripcion || "Sin descripción disponible para este proyecto."}
              </p>
            </article>

          </section>

          {/* FEEDBACK Y SÍNTESIS IA */}
          {proyectoActual?.id && categoria?.id ? (
            <ProyectoFeedbackCard
              idProyecto={proyectoActual.id}
              nombreProyecto={proyectoActual.nombre || "Sin nombre"}
              idCategoria={categoria.id}
              nombreCategoria={categoria.nombre || "Global"}
              estadoCategoria={categoria.estado || categoria.Estado || "Pendiente"}
              comentariosJuradoCount={comentariosJuradoCount}
              comentariosPublicoCount={comentariosPublicoCount}
            />
          ) : null}
        </main>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Eliminar proyecto"
        message={
          <>
            ¿Estás seguro de que deseas eliminar "<strong className="font-semibold">{projectToDelete?.nombre}</strong>"? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={deleteProject}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        isLoading={isDeletingProject}
        danger
      />
    </div>
  );
}