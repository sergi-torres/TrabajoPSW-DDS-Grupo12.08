import { useState, useEffect, useContext } from "react";
import { API_BASE_URL } from "../config/api";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../components/ui/badge";
import { AuthContext } from "../context/AuthContext";

export default function EditarProyectoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userId, userName } = useContext(AuthContext)!;
  const [proyecto, setProyecto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [additionalMembers, setAdditionalMembers] = useState<any[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberIds, setMemberIds] = useState<number[]>([]);


  const cargarMiembrosPorIds = async (ids: number[]) => {
    if (!ids || ids.length === 0) return [];
    
    const miembros = [];
    for (const memberId of ids) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/usuario/${memberId}`);
        if (response.ok) {
          const usuario = await response.json();
          miembros.push({
            id: usuario.id,
            email: usuario.email,
            nombre: usuario.nombreCompleto || usuario.email
          });
        }
      } catch {
        // Non-critical: member is omitted from the display list
      }
    }
    return miembros;
  };


  useEffect(() => {
  const cargarProyecto = async () => {
    try {
      let proyectoData = null;
      
      // ProjectPage caches the project in localStorage before navigating here
      // because this page has no route param for project data beyond the ID.
      const stored = localStorage.getItem("proyectoEditando");
      if (stored) {
        try {
          proyectoData = JSON.parse(stored);
        } catch {
          // Corrupted cache — fall through to fetch from API
        }
      }
      
      // Si no está en localStorage, cargar desde API
      if (!proyectoData && id) {
        const res = await fetch(`${API_BASE_URL}/api/votacion/porProyecto?proyectoId=${id}`);
        if (res.ok) {
          proyectoData = await res.json();
        }
      }

      if (proyectoData) {
        // Asegurar que idParticipante existe
        if (!proyectoData.idParticipante) {
          proyectoData.idParticipante = proyectoData.idCreador || proyectoData.liderId || 0;
        }
        
        setProyecto(proyectoData);
        
        // Filtrar al líder de los miembros
        const liderId = proyectoData.idParticipante;
        const idsMiembros = (proyectoData.idMiembros || []).filter((id: number) => id !== liderId);
        setMemberIds(idsMiembros);
        
        if (idsMiembros.length > 0) {
          const miembrosData = await cargarMiembrosPorIds(idsMiembros);
          setAdditionalMembers(miembrosData);
        } else {
          setAdditionalMembers([]);
        }
      }
    } catch {
    } finally {
      setCargando(false);
    }
  };

  cargarProyecto();
}, [id]);

  // Agregar miembro por email
 const handleAddMember = async () => {
  if (!newMemberEmail || !newMemberEmail.includes("@")) {
    toast.error("Correo inválido");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/usuario/email/${encodeURIComponent(newMemberEmail)}`);
    if (!response.ok) {
      toast.error("Usuario no encontrado");
      return;
    }

    const usuario = await response.json();

    // Verificar que no sea el organizador
    if (usuario.id === proyecto?.idParticipante) {
      toast.error("No puedes agregar al organizador como miembro");
      return;
    }
    
    // ✅ Verificar si ya existe
    if (memberIds.includes(usuario.id)) {
      toast.error("Usuario ya está en el equipo");
      return;
    }

    // Crear nuevos arrays
    const nuevosMemberIds = [...memberIds, usuario.id];
    const nuevosAdditionalMembers = [...additionalMembers, { 
      id: usuario.id, 
      email: usuario.email,
      nombre: usuario.nombreCompleto || usuario.email
    }];
    
    // Actualizar estados
    setMemberIds(nuevosMemberIds);
    setAdditionalMembers(nuevosAdditionalMembers);
    setNewMemberEmail("");
    
    toast.success(`Usuario ${usuario.email} agregado al equipo`);
    
    // ✅ Forzar actualización del proyecto después de agregar
    // Actualizar también el objeto proyecto para mantener consistencia
    setProyecto((prev: any) => ({
      ...prev,
      idMiembros: nuevosMemberIds
    }));
    
  } catch {
    toast.error("Error al buscar usuario");
  }
};

  // Eliminar miembro
  const handleRemoveMember = (index: number) => {
    const memberToRemove = additionalMembers[index];
    const newMembers = [...additionalMembers];
    newMembers.splice(index, 1);
    setAdditionalMembers(newMembers);
    setMemberIds(memberIds.filter(id => id !== memberToRemove.id));
    toast.success("Miembro eliminado del equipo");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const proyectoIdEvento = proyecto.idEvento;

    const miembrosOriginales = proyecto.idMiembros || []; // Los que ya tenía el proyecto
    const miembrosNuevos = memberIds; // Los que agregaste en el formulario
  
    // Combinar sin duplicados
    const todosLosMiembros = [...new Set([...miembrosOriginales, ...miembrosNuevos])];
  
    // Excluir al líder (idParticipante) de la lista de miembros
    const miembrosFinales = todosLosMiembros.filter(id => id !== proyecto.idParticipante);
    const proyectoActualizado = {
      id: proyecto.id,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      urlMultimedia: proyecto.urlMultimedia,
      idParticipante: userId ?? proyecto.idParticipante,
      idCategoria: proyecto.idCategoria,
      idEvento: proyectoIdEvento || parseInt(localStorage.getItem("idEvento") || "0"), // idEvento cache set by ProjectPage
      estado: proyecto.estado,
      idMiembros: miembrosNuevos
    };

    try {
      // Token is read from localStorage here because EditarProyectoPage
      // does not have access to AuthContext token through the API layer.
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/proyectos/${proyecto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(proyectoActualizado)
      });
      
      if (response.status === 401 || response.status === 403) {
        toast.error("Sesión expirada. Por favor, inicia sesión nuevamente");
        navigate("/login");
        return;
      }
      
      if (response.ok) {
        toast.success("Proyecto actualizado exitosamente");
        navigate(-1);
      } else {
        toast.error("Error al actualizar el proyecto");
      }
    } catch {
      toast.error("Error al actualizar el proyecto");
    }
  };

  const volverAtras = () => {
    navigate(-1);
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

  if (!proyecto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Proyecto no encontrado</p>
          <button
            onClick={volverAtras}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barra superior con botón de volver */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={volverAtras}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Editar Proyecto</h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {/* Campo: Nombre */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto *
            </label>
            <input
              type="text"
              value={proyecto.nombre || ""}
              onChange={(e) => setProyecto({ ...proyecto, nombre: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          {/* Campo: Descripción */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              value={proyecto.descripcion || ""}
              onChange={(e) => setProyecto({ ...proyecto, descripcion: e.target.value })}
              rows={5}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
              required
            />
          </div>

          {/* Campo: URL Multimedia (opcional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Multimedia (opcional)
            </label>
            <input
              type="text"
              value={proyecto.urlMultimedia || ""}
              onChange={(e) => setProyecto({ ...proyecto, urlMultimedia: e.target.value })}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Campo: Categoría */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={proyecto.idCategoria || ""}
              onChange={(e) => setProyecto({ ...proyecto, idCategoria: parseInt(e.target.value) })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              required
            >
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {JSON.parse(localStorage.getItem("categorias") || "[]").map((categoria: any) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Campo: Participantes */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-4 ml-1">
              <Users className="w-4 h-4 inline mr-2 text-purple-600" />
              Equipo ({additionalMembers.length + 1} miembros)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Líder del proyecto */}
              <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                  {userName?.charAt(0).toUpperCase() || "L"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {userName || "Usuario"}
                  </p>
                  <p className="text-[10px] text-purple-600 uppercase font-black tracking-widest">Organizador</p>
                </div>
                <Badge className="bg-purple-100 text-purple-700 font-bold border-none">Líder</Badge>
              </div>

              {/* Lista de miembros adicionales */}
              {additionalMembers.map((member: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                    {member.email?.charAt(0).toUpperCase() || "M"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 truncate">{member.email || member.nombre}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Miembro</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(index)}
                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Mensaje cuando no hay miembros adicionales */}
            {additionalMembers.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200 mt-4">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No hay miembros adicionales en el equipo</p>
                <p className="text-xs text-gray-300">Agrega miembros usando el campo de abajo</p>
              </div>
            )}

            {/* Input para agregar nuevo miembro */}
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
              >
                Agregar
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 ml-1">
              Agrega a los miembros de tu equipo por correo electrónico
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={volverAtras}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}