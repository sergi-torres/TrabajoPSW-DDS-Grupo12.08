import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Users, Code } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useState } from "react";
import { createProyecto } from "../api/proyectoApi";
import { toast } from "sonner";

export default function CreateProject() {
  const navigate = useNavigate();
  const [projectData, setProjectData] = useState({
    name: "",
    description: "",
    technology: "",
    team: 1,
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [technologies, setTechnologies] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTechnology = () => {
    if (projectData.technology.trim() && !technologies.includes(projectData.technology.trim())) {
      setTechnologies([...technologies, projectData.technology.trim()]);
      setProjectData(prev => ({ ...prev, technology: "" }));
    }
  };

  const removeTechnology = (tech) => {
    setTechnologies(technologies.filter(t => t !== tech));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!projectData.name || !projectData.description) {
        toast.error("Faltan campos obligatorios", { description: "Por favor completa el nombre y descripción del proyecto "});
        return;
    }

    // Obtener datos del usuario logueado
    const userId = localStorage.getItem("userId");
    const eventoId = localStorage.getItem("eventoId");

    // ✅ CORREGIDO: Usa los nombres de propiedad que espera el backend
    const newProject = {
        nombre: projectData.name,              // ← "nombre" no "name"
        descripcion: projectData.description,  // ← "descripcion" no "description"
        urlMultimedia: imagePreview || projectData.image || "🚀", // ← "urlMultimedia" no "image"
        idEvento: null,
        idParticipante: userId ? parseInt(userId) : 16,
        idCategoria: null,
        estado: "disponible"
    };

    console.log("Datos del nuevo proyecto:", newProject);
    
    try {
        const res = await createProyecto(newProject);
        console.log("Proyecto creado:", res);
        toast.success(`¡Proyecto "${projectData.name}" creado exitosamente!`);
        navigate("/participantRegister");
    } catch (error) {
        console.error("Error al crear el proyecto:", error);
        alert("Error al crear proyecto: " + error.message);
    }
};

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/participantRegister")}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div>
            <h1 className="text-4xl mb-2">Crear Nuevo Proyecto</h1>
            <p className="text-purple-100">Completa los detalles de tu proyecto para registrarlo</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen del Proyecto */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                Imagen del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Vista previa"
                      className="w-40 h-40 rounded-2xl object-cover shadow-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setSelectedImage(null);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-6xl shadow-lg">
                    🚀
                  </div>
                )}
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>{imagePreview ? "Cambiar imagen" : "Subir imagen"}</span>
                  </div>
                </label>
                <p className="text-xs text-gray-500">PNG, JPG o GIF. Tamaño máximo 5MB</p>
              </div>
            </CardContent>
          </Card>

          {/* Información Básica */}
          <Card className="border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Save className="w-6 h-6 text-purple-600" />
                Información del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Nombre del Proyecto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={projectData.name}
                  onChange={handleInputChange}
                  placeholder="Ej: Votify Platform"
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  value={projectData.description}
                  onChange={handleInputChange}
                  placeholder="Describe tu proyecto..."
                  rows="4"
                  className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tecnologías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tecnologías Utilizadas
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    name="technology"
                    value={projectData.technology}
                    onChange={handleInputChange}
                    placeholder="Ej: React, Node.js, MongoDB"
                    className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                  />
                  <Button
                    type="button"
                    onClick={addTechnology}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Agregar
                  </Button>
                </div>
                {technologies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <Code className="w-4 h-4 text-purple-600" />
                    {technologies.map((tech) => (
                      <Badge
                        key={tech}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300 flex items-center gap-1"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="hover:text-purple-900 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Tamaño del Equipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Tamaño del Equipo
                </label>
                <input
                  type="number"
                  name="team"
                  value={projectData.team}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  className="w-32 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </CardContent>
          </Card>

          {/* Resumen y Botón de Creación */}
          <Card className="border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl mb-4">Resumen del Proyecto</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Nombre:</span>
                      <span className="text-gray-700">{projectData.name || "(Sin nombre)"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Equipo:</span>
                      <span className="text-gray-700">{projectData.team} miembros</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tecnologías:</span>
                      <span className="text-gray-700">{technologies.length || "0"}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <Save className="w-6 h-6 mr-2" />
                  Crear Proyecto
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}