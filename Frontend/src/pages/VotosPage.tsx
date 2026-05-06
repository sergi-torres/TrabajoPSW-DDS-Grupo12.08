import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { EventSidebar } from "../components/layout/EventSidebar";
import { MobileNav } from "../components/eventos/MobileNav";
import { useVoting } from "../context/VotingContext";
import { 
  ArrowLeft, 
  Target, 
  Award, 
  TrendingUp, 
  MessageSquare, 
  User, 
  ThumbsUp,
  Star,
  Trash2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { cn } from "../components/ui/utils";

// ============================================
// SUB-COMPONENTES
// ============================================
// CONTEXTO DE VOTACIÓN
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
  const navigate = useNavigate();
  const { isPublic, userName } = useContext(AuthContext)!;
  const { userColor, isCollapsed, userRole } = useContext(EventContext)!;

  const { addNotification } = useVoting();

  const [votaciones, setVotaciones] = useState<any[]>([]);
  const [categoria, setCategoria] = useState<any>(null);
  const [publicComments, setPublicComments] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [proyectosDisponibles, setProyectosDisponibles] = useState<any[]>([]);
  const [proyectoActualId, setProyectoActualId] = useState<string | null>(null);

  const isPublicRole = userRole === "Público";
  const themeColor = userColor || "#9333ea";

        // 3. Obtener categoría

  const obtenerCategoria = async () => {
    const idCategoria = localStorage.getItem("categoriaProyecto");

    if (idCategoria) {
        const catRes = await fetch(`http://localhost:5245/api/categorias/id/${idCategoria}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategoria(catData);
          localStorage.setItem("categoriaNombre", catData.nombre);
        }
    }
   };


  // Cargar lista de proyectos desde localStorage
  useEffect(() => {
    const storedProyectos = localStorage.getItem("proyectos");
    if (storedProyectos) {
      const proyectos = JSON.parse(storedProyectos);
      setProyectosDisponibles(proyectos); 
    }
    const currentId = localStorage.getItem("proyectoId");
    setProyectoActualId(currentId);
  }, []);

  // FETCH DE COMENTARIOS Y VOTACIONES
  const fetchData = async (proyectoId: string) => {
    setCargando(true);
    try {
      // 1. Obtener votaciones
      const votoRes = await fetch(`http://localhost:5245/api/votacion/porProyecto?proyectoId=${proyectoId}`);
      if (!votoRes.ok) throw new Error("Error al obtener votaciones");
      const dataVoto = await votoRes.json();
      setVotaciones(dataVoto);

      // 2. Obtener comentarios
      if (dataVoto && dataVoto.length > 0) {
        const comentariosPromises = dataVoto.map((voto: any) =>
          fetch(`http://localhost:5245/api/comentarios?idVotacion=${voto.id}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        );
        const resultadosComentarios = await Promise.all(comentariosPromises);
        const todosLosComentarios = resultadosComentarios.flat();

        const mapped = todosLosComentarios.map((c: any) => ({
          id: c.id,
          author: c.nombreUsuario || c.email || "Anónimo",
          comment: c.comentario,
          timestamp: new Date(c.fecha).toLocaleString(),
          likes: c.likes ?? 0
        }));
        setPublicComments(mapped);
      } else {
        setPublicComments([]);
      }

    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const idProyecto = localStorage.getItem("proyectoId");
    if (idProyecto) {
      fetchData(idProyecto);
    } else {
      setCargando(false);
    }
  }, []);

  // Navegar a proyecto anterior
  const goToPreviousProject = () => {
    if (!proyectosDisponibles.length) return;
    const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActualId);
    if (currentIndex > 0) {
      const prevProject = proyectosDisponibles[currentIndex - 1];
      localStorage.setItem("proyectoId", prevProject.id);
      localStorage.setItem("proyectoNombre", prevProject.nombre);
      localStorage.setItem("proyectoDescripcion", prevProject.descripcion);
      localStorage.setItem("categoriaProyecto", prevProject.idCategoria);
      setProyectoActualId(prevProject.id);
      fetchData(prevProject.id);
      obtenerCategoria();
    } else {
      alert("No hay proyecto anterior");
    }
  };

  // Navegar a proyecto siguiente
  const goToNextProject = () => {
    if (!proyectosDisponibles.length) return;
    const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActualId);
    if (currentIndex < proyectosDisponibles.length - 1) {
      const nextProject = proyectosDisponibles[currentIndex + 1];
      localStorage.setItem("proyectoId", nextProject.id);
      localStorage.setItem("proyectoNombre", nextProject.nombre);
      localStorage.setItem("proyectoDescripcion", nextProject.descripcion);
      localStorage.setItem("categoriaProyecto", nextProject.idCategoria);
      setProyectoActualId(nextProject.id);
      fetchData(nextProject.id);
      obtenerCategoria();
    } else {
      alert("No hay proyecto siguiente");
    }
  };

  // Eliminar proyecto actual
  const deleteProject = async () => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que quieres eliminar este proyecto?\n\nEsta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    try {
      const proyectoId = localStorage.getItem("proyectoId");
      if (!proyectoId) {
        alert("No se encontró el ID del proyecto");
        return;
      }

      const response = await fetch(`http://localhost:5245/api/proyectos/${proyectoId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Actualizar lista de proyectos
        const nuevosProyectos = proyectosDisponibles.filter(p => p.id != proyectoId);
        localStorage.setItem("proyectos", JSON.stringify(nuevosProyectos));
        
        addNotification("project_deleted", "Proyecto" + localStorage.getItem("proyectoNombre") + " eliminado correctamente");

        // Limpiar datos del proyecto actual
        localStorage.removeItem("proyectoId");
        localStorage.removeItem("proyectoNombre");
        localStorage.removeItem("proyectoDescripcion");
        localStorage.removeItem("proyectoABCD");
        localStorage.removeItem("categoriaProyecto");


        if (nuevosProyectos.length > 0) {
          // Cargar el primer proyecto disponible
          const primerProyecto = nuevosProyectos[0];
          localStorage.setItem("proyectoId", primerProyecto.id);
          localStorage.setItem("proyectoNombre", primerProyecto.nombre);
          localStorage.setItem("proyectoDescripcion", primerProyecto.descripcion);
          setProyectoActualId(primerProyecto.id);
          setProyectosDisponibles(nuevosProyectos);
          fetchData(primerProyecto.id);
        } else {
          navigate("/eventos");
        }
        
        alert("Proyecto eliminado exitosamente");
      } else {
        alert("Error al eliminar el proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al eliminar el proyecto");
    }
  };

  const currentIndex = proyectosDisponibles.findIndex(p => p.id == proyectoActualId);
  const state = {
    participantName: userName || localStorage.getItem("userName") || "Usuario",
    projectName: localStorage.getItem("eventoNombre") || "Evento",
    overallScore: 85.75
  };

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
                  <span style={{ color: themeColor }}>Nombre:</span> {localStorage.getItem("proyectoNombre") || "Sin nombre"}
                </p>
                <p className="text-xl font-heading font-bold text-gray-900">
                  <span className="text-blue-600">Categoría:</span> {localStorage.getItem("categoriaNombre") || "Global"}
                </p>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                <span>Descripción:</span> {localStorage.getItem("proyectoDescripcion") || "Sin descripción disponible para este proyecto."}
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

          {/* CRITERIOS */}
          <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900">Evaluación Detallada</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {EVALUATION_CRITERIA.map((item) => (
                <CriterionBar key={item.name} {...item} color={themeColor} />
              ))}
            </div>
          </section>

          {/* COMENTARIOS */}
          <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">Feedback del Público</h2>
                  <p className="text-sm text-gray-500">Lo que otros participantes y asistentes opinan</p>
                </div>
              </div>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {publicComments.length} Comentarios
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicComments.length > 0 ? (
                publicComments.map((comment) => (
                  <CommentCard key={comment.id} {...comment} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-gray-400 font-medium">Aún no hay comentarios públicos para este proyecto.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}