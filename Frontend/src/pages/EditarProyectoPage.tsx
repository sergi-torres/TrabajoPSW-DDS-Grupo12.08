import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { editarProyecto } from "../api/proyectoApi";

export default function EditarProyectoPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [proyecto, setProyecto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarProyecto = async () => {
      try {
        // Intentar cargar desde localStorage primero
        const stored = localStorage.getItem("proyectoEditando");
        if (stored) {
          setProyecto(JSON.parse(stored));
        } else if (id) {
          // Si no está en localStorage, cargar desde API
          const response = await fetch(`http://localhost:5245/api/proyectos/${id}`);
          if (response.ok) {
            const data = await response.json();
            setProyecto(data);
          }
        }
      } catch (error) {
        console.error("Error cargando proyecto:", error);
      } finally {
        setCargando(false);
      }
    };

    cargarProyecto();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedProyecto = await editarProyecto(proyecto.id, proyecto);
      
      if (response.ok) {
        localStorage.removeItem("proyectoEditando");
        alert("Proyecto actualizado exitosamente");
        navigate(-1); // Volver a la página anterior
      } else {
        alert("Error al actualizar el proyecto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al actualizar el proyecto");
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
            <div className="w-20" /> {/* Espaciador para centrar el título */}
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