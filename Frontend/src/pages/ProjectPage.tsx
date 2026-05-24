import { useEffect, useState, useContext } from "react";
import { API_BASE_URL } from "../config/api";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { EventSidebar } from "../components/layout/EventSidebar";
import { useVoting } from "../context/VotingContext";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown, Minus, Target, Medal, Star, Trash2, Plus, Pencil } from "lucide-react";
import { cn } from "../components/ui/utils";
import { toast } from "sonner";
import { ConfirmModal } from "../components/layout/ConfirmModal";
import SimpleSearchBar from "../components/layout/SimpleSearchBar";

// ============================================
// TIPOS
// ============================================

interface Project {
  id: number;
  nombre: string;
  descripcion: string;
  urlMultimedia: string;
  idCategoria: number;
  idMiembros?: any[];
  idEvento?: number;
}

interface Puntuacion {
  id: number;
  proyectoId: number;
  categoriaId: number;
  puntaje: number;
  tipo: "JURADO" | "PUBLICO";
}

interface Categoria {
  id: number;
  nombre: string;
  estado: string;
}

// ============================================
// COMPONENTE DE TAB
// ============================================

function TabButton({ 
  active, 
  onClick, 
  children, 
  icon,
  accentColor,
  accentHover,
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  icon: React.ReactNode;
  accentColor: string;
  accentHover: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all",
        active
          ? "text-white shadow-lg"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      )}
      style={active ? { backgroundColor: accentColor } : undefined}
      onMouseEnter={(e) => {
        if (!active) return;
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = accentHover;
      }}
      onMouseLeave={(e) => {
        if (!active) return;
        (e.currentTarget as HTMLButtonElement).style.backgroundColor = accentColor;
      }}
    >
      {icon}
      {children}
    </button>
  );
}


// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function ProjectPage() {
  const navigate = useNavigate();
  const { isPublic, userName } = useContext(AuthContext)!;
  const { userColor, isCollapsed, userRole } = useContext(EventContext)!;

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [proyectos, setProyectos] = useState<Project[]>([]);
  const [puntuaciones, setPuntuaciones] = useState<Puntuacion[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [cargando, setCargando] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectIdToDelete, setProjectIdToDelete] = useState<number | null>(null);
  const [projectNameToDelete, setProjectNameToDelete] = useState<string | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [busquedaProyectos, setBusquedaProyectos] = useState('');

  const isPublicRole = userRole === "Público";
  const themeColor = userColor || "#9333ea";

  const { addNotification } = useVoting();

  // Obtener rol del organizador
  const getRol = () => {
    try {
      const rolData = JSON.parse(localStorage.getItem("propsRol") || "{}");
      return rolData.label;
    } catch {
      return null;
    }
  };

  const esOrganizador = getRol() === "Organizador";

  // Obtener puntuación de un proyecto en una categoría específica
  const obtenerPuntaje = (
    proyectoId: number,
    categoriaId: number,
    tipo: "JURADO" | "PUBLICO"
  ) => {
    const puntuacion = puntuaciones.find(
      p =>
        p.proyectoId === proyectoId &&
        p.categoriaId === categoriaId &&
        p.tipo === tipo
    );
    return puntuacion?.puntaje || 0;
  };

  const editarProyecto = (proyecto: Project) => {
  // Guardar datos del proyecto a editar en localStorage
  localStorage.setItem("proyectoEditando", JSON.stringify({
    id: proyecto.id,
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion,
    urlMultimedia: proyecto.urlMultimedia,
    idCategoria: proyecto.idCategoria,
    idMiembros: proyecto.idMiembros
  }));
  
  // Redirigir a la página de edición (crea esta página después)
  localStorage.setItem("idEvento", String(proyecto.idEvento));
  localStorage.setItem("categorias", JSON.stringify(categorias));
  localStorage.setItem("usuarios", JSON.stringify(proyecto.idMiembros)); // Asumiendo que idMiembros es un array de IDs de usuarios
  navigate(`/editar-proyecto/${proyecto.id}`);
};

  // Calcular puntaje total de un proyecto en la categoría activa
  const obtenerPuntajeTotal = (proyectoId: number, categoriaId: number) => {
    const jurado = obtenerPuntaje(proyectoId, categoriaId, "JURADO");
    const publico = obtenerPuntaje(proyectoId, categoriaId, "PUBLICO");
    return jurado + publico;
  };

  // Eliminar proyecto
  const confirmDeleteProyecto = (proyecto: Project) => {
    setProjectIdToDelete(proyecto.id);
    setProjectNameToDelete(proyecto.nombre);
    setIsDeleteModalOpen(true);
  };

  const eliminarProyecto = async () => {
    if (!projectIdToDelete) return;
    setIsDeletingProject(true);

try {
  const response = await fetch(`${API_BASE_URL}/api/proyectos/${projectIdToDelete}`, {
    method: "DELETE",
  });

  if (response.ok) {
    setProyectos(prev => prev.filter(p => p.id !== projectIdToDelete));
    toast.success("Proyecto eliminado exitosamente");
    
    //Pasar state como string y mensaje como categoryName
    addNotification("project_deleted", `El proyecto "${projectNameToDelete ?? ""}" ha sido eliminado.`);
    
    setIsDeleteModalOpen(false);
    setProjectIdToDelete(null);
    setProjectNameToDelete(null);
  } else {
    toast.error("Error al eliminar el proyecto");
  }
} catch (error) {
  console.error("Error:", error);
  toast.error("Error al eliminar el proyecto");
} finally {
  setIsDeletingProject(false);
}
  };

  const proyectosFiltradosPorCategoria = categoriaActiva
    ? proyectos.filter(p => p.idCategoria === categoriaActiva)
    : proyectos;

  const proyectosFiltrados = proyectosFiltradosPorCategoria.filter((p) => {
    const termino = busquedaProyectos.toLowerCase().trim();
    if (!termino) return true;
    return (
      (p.nombre || "").toLowerCase().includes(termino) ||
      (p.descripcion || "").toLowerCase().includes(termino)
    );
  });

  // Ordenar proyectos por puntaje total
  const proyectosOrdenados = [...proyectosFiltrados].sort((a, b) => {
    const puntajeA = categoriaActiva ? obtenerPuntajeTotal(a.id, categoriaActiva) : 0;
    const puntajeB = categoriaActiva ? obtenerPuntajeTotal(b.id, categoriaActiva) : 0;
    return puntajeB - puntajeA;
  });

  // Cargar datos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const eventoId = localStorage.getItem("eventoId");
        if (!eventoId) {
          console.error("No hay eventoId");
          setCargando(false);
          return;
        }

        // 1. Cargar categorías del evento
        const categoriasRes = await fetch(`${API_BASE_URL}/api/categorias/evento/${eventoId}`);
        const categoriasData = await categoriasRes.json();
        setCategorias(categoriasData);
        
        if (categoriasData.length > 0) {
          setCategoriaActiva(categoriasData[0].id);
        }

        // 2. Cargar proyectos del evento
        const proyectosRes = await fetch(`${API_BASE_URL}/api/proyectos/evento/${eventoId}`);
        const proyectosData = await proyectosRes.json();
        setProyectos(proyectosData);

        // 3. Cargar puntuaciones
        const todasPuntuaciones: Puntuacion[] = [];
        for (const proyecto of proyectosData) {
          const res = await fetch(`${API_BASE_URL}/api/votacion/porProyecto?proyectoId=${proyecto.id}`);
          if (res.ok) {
            const data = await res.json();
            todasPuntuaciones.push(...data);
          }
        }
        setPuntuaciones(todasPuntuaciones);

      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

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
          style={{ backgroundColor: themeColor || 'var(--color-part)' }}
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
                Proyectos
              </h1>
              <p className="opacity-90 text-lg font-medium">
                Ranking por categorías
              </p>
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-8 transition-all duration-300",
          isPublicRole ? "" : (isCollapsed ? "lg:pl-28" : "lg:pl-80")
        )}>
          
          {/* Tabs de Categorías */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2.5 rounded-xl"
                style={{ color: userRole === "Organizador" ? "var(--color-org)" : userRole === "Jurado" ? "var(--color-jur)" : "var(--color-part)" }}
              >
                <Target size={20} />
              </div>

              <h2 className="text-xl font-heading font-bold text-gray-900">Categorías del Evento</h2>

            </div>
            
            <div className="flex flex-wrap gap-3">
              {categorias.map((cat) => (
                <TabButton
                  key={cat.id}
                  active={categoriaActiva === cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  icon={<Target size={16} />}
                  accentColor={
                    userRole === "Organizador"
                      ? "var(--color-org)"
                      : userRole === "Jurado"
                        ? "var(--color-jur)"
                        : "var(--color-part)"
                  }
                  accentHover={
                    userRole === "Organizador"
                      ? "rgba(59, 130, 246, 0.92)"
                      : userRole === "Jurado"
                        ? "rgba(249, 115, 22, 0.92)"
                        : "rgba(139, 92, 246, 0.92)"
                  }
                >
                  {cat.nombre}
                </TabButton>
              ))}
            </div>

          </div>

          {/* Ranking de Proyectos por Categoría */}
          {categoriaActiva && (
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 animate-in slide-in-from-bottom duration-300">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center mb-6">
                <div className="w-full lg:max-w-md">
                  <label className="sr-only" htmlFor="busquedaProyectos">Buscar proyectos</label>
                  <div className="w-full flex justify-start">
                    <SimpleSearchBar
                      value={busquedaProyectos}
                      onChange={setBusquedaProyectos}
                      placeholder="Buscar por nombre de proyecto"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {esOrganizador && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={() => {
                      if (localStorage.getItem("proyectoABCD")) {
                        localStorage.removeItem("proyectoABCD");
                      }

                      localStorage.setItem("registrationColorMode", (userRole === "Organizador" ? "org" : "part"));
                      navigate(`/eventos/${localStorage.getItem("eventoId")}/participantRegister`);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-white rounded-xl transition-all text-sm font-medium"
                    style={{ backgroundColor: userRole === "Organizador" ? "var(--color-org)" : userRole === "Jurado" ? "var(--color-jur)" : "var(--color-part)" }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor =
                        userRole === "Organizador"
                          ? "rgba(59, 130, 246, 0.92)"
                          : userRole === "Jurado"
                            ? "rgba(249, 115, 22, 0.92)"
                            : "rgba(139, 92, 246, 0.92)";
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget;
                      btn.style.backgroundColor =
                        userRole === "Organizador"
                          ? "var(--color-org)"
                          : userRole === "Jurado"
                            ? "var(--color-jur)"
                            : "var(--color-part)";
                    }}
                  >
                    <Plus size={16} />
                    Crear proyecto
                  </button>
                </div>
              )}

              {proyectosOrdenados.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay proyectos registrados en esta categoría.
                </div>
              ) : (
                <div className="space-y-4">
                  {proyectosOrdenados.map((proyecto, idx) => {
                    const puntajeJurado = obtenerPuntaje(proyecto.id, categoriaActiva!, "JURADO");
                    const puntajePublico = obtenerPuntaje(proyecto.id, categoriaActiva!, "PUBLICO");
                    const puntajeTotal = puntajeJurado + puntajePublico;
                    const percentage = Math.min(100, (puntajeTotal / 200) * 100);
                    
                    const medalColors = ["#F59E0B", "#9CA3AF", "#CD7F32"];
                    const medalColor = idx < 3 ? medalColors[idx] : "#9CA3AF";

                    return (
                      <div
                        key={proyecto.id}
                        className="bg-gradient-to-r from-white to-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4">
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                              style={{ backgroundColor: medalColor }}
                            >
                              {idx + 1}
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{proyecto.nombre}</h3>
                              <p className="text-sm text-gray-500 line-clamp-1">{proyecto.descripcion}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div
                                className="text-2xl font-bold"
                                style={{ color: userRole === "Organizador" ? "var(--color-org)" : userRole === "Jurado" ? "var(--color-jur)" : "var(--color-part)" }}
                              >
                                {puntajeTotal}%
                              </div>
                              <div className="text-xs text-gray-400">Puntaje Total</div>
                            </div>

                            {/* Botón de eliminar - solo organizador */}
                            {esOrganizador && (
                              <button
                                onClick={() => confirmDeleteProyecto(proyecto)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="Eliminar proyecto"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                            {/* Botón Modificar */}
                            {esOrganizador && (
                              <button
                                onClick={() => editarProyecto(proyecto)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                title="Modificar proyecto"
                              >
                                <Pencil size={18} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Barra de progreso */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-purple-600" />
                              Jurado: {puntajeJurado}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Star size={12} className="text-blue-600" />
                              Público: {puntajePublico}%
                            </span>
                            <span>Total: {puntajeTotal}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${percentage}%`,
                                background: `linear-gradient(90deg, ${themeColor}, ${themeColor}dd)`
                              }}
                            />
                          </div>
                        </div>

                        {/* Barras separadas Jurado vs Público */}
                        <div className="mt-3 flex gap-2">
                          <div className="flex-1">
                            <div className="text-xs text-purple-600 mb-1">Jurado</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-purple-600 rounded-full transition-all"
                                style={{ width: `${puntajeJurado}%` }}
                              />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-blue-600 mb-1">Público</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${puntajePublico}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
      
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Eliminar proyecto"
        message={
          <>
            ¿Estás seguro de que deseas eliminar "<strong className="font-semibold">{projectNameToDelete}</strong>"? Esta acción no se puede deshacer.
          </>
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        onConfirm={eliminarProyecto}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProjectIdToDelete(null);
          setProjectNameToDelete(null);
        }}
        isLoading={isDeletingProject}
        danger
      />
    </div>
  );
}