import { ArrowLeft, Check, Target, Calendar, Users, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react"; 
import { useVoting } from "../context/VotingContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { createProyecto } from "../api/proyectoApi";

export default function RegisterParticipant() {
  const navigate = useNavigate();
  const { categories, eventConfig } = useVoting();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>({
    name: "",
    description: "",
    team: 1,
    memberIds: []
  });

  useEffect(() => {
  const userId = localStorage.getItem("userId");
  if (userId && projectData.memberIds.length === 0) {
    setProjectData((prev: any) => ({
      ...prev,
      memberIds: [parseInt(userId)]
    }));
  }
  }, [projectData.memberIds.length]);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [projectCreated, setProjectCreated] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProjectData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContinue = () => {
    if (!projectData.name || !projectData.description) {
      toast.error("Faltan campos obligatorios", { description: "Por favor completa el nombre y descripción del proyecto "});
      return;
    }
    setProjectCreated(true);
  };

  const handleRegister = async () => {
  if (projectCreated && (selectedCategory || categories.length === 0)) {
    try {
      const userId = localStorage.getItem("userId");
      const eventoId = localStorage.getItem("eventoId");      

      const newProject = {
        nombre: projectData.name,
        descripcion: projectData.description,
        urlMultimedia: imagePreview || "🚀",
        idEvento: eventoId ? parseInt(eventoId) : null,
        idParticipante: userId ? parseInt(userId) : 16,
        idCategoria: selectedCategory ? parseInt(selectedCategory) : null,
        idMiembros : projectData.memberIds,
        estado: "disponible"
      };

      const res = await createProyecto(newProject);
      console.log("Proyecto creado:", res);
      
      toast.success(`Proyecto registrado exitosamente!\n\nProyecto: ${projectData.name}\nCategoría: ${categories.find((c: any) => c.id === selectedCategory)?.name}`);
      navigate("/eventos");
    } catch (error: any) {
      console.error("Error al crear el proyecto:", error);
      toast.error("Error al crear proyecto", { description: error.message });
    }
  }
};

  const isReadyToRegister = projectCreated && (selectedCategory || categories.length === 0);

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={
                () => 
                {   navigate("/eventos");
                }
            }
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div>
            <h1 className="text-4xl mb-2">Registrar Proyecto</h1>
            <p className="text-purple-100">Crea tu proyecto para {eventConfig.eventName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Paso 1: Crear Proyecto */}
        {!projectCreated ? (
          <Card className="border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                Paso 1: Crea tu Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Imagen del Proyecto */}
                <div className="flex flex-col items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Vista previa" className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setSelectedImage(null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center text-5xl shadow-lg">
                      🚀
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                      <Upload className="w-4 h-4" />
                      <span>{imagePreview ? "Cambiar imagen" : "Subir imagen"}</span>
                    </div>
                  </label>
                </div>

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
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    rows={4}
                    className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>



{/* Participantes del Proyecto */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-2">
    <Users className="w-4 h-4 inline mr-1" />
    Participantes del Proyecto ({1 + (projectData.additionalMembers?.length || 0)} miembros)
  </label>
  
  {/* Participante actual (fijo) */}
  <div className="flex items-center gap-2 mb-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm">
      {localStorage.getItem("email")?.charAt(0).toUpperCase() || "U"}
    </div>
    <div className="flex-1">
      <p className="font-medium text-gray-900">{localStorage.getItem("email") || "Usuario"}</p>
      <p className="text-xs text-gray-500">Tú (Creador)</p>
    </div>
    <Badge className="bg-purple-100 text-purple-700">Propietario</Badge>
  </div>

  {/* Lista de participantes adicionales */}
  {projectData.additionalMembers?.map((member: any, index: number) => (
    <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-sm">
        {member.email?.charAt(0).toUpperCase() || "M"}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{member.email}</p>
        <p className="text-xs text-gray-500">Miembro</p>
      </div>
      <button
        type="button"
        onClick={() => {
          const newMembers = [...projectData.additionalMembers];
          newMembers.splice(index, 1);
          setProjectData((prev: any) => ({ ...prev, additionalMembers: newMembers }));
        }}
        className="text-red-500 hover:text-red-700"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ))}

  {/* Botón para agregar más participantes */}
  <div className="flex gap-2 mt-2">
    <input
      type="email"
      placeholder="correo@ejemplo.com"
      value={projectData.newMemberEmail || ""}
      onChange={(e) => setProjectData((prev: any) => ({ ...prev, newMemberEmail: e.target.value }))}
      
      className="flex-1 px-3 py-2 text-sm border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
    />
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        if (projectData.newMemberEmail && projectData.newMemberEmail.includes("@")) {
            try {
                // Buscar el usuario por email en el backend
                const response = await fetch(`http://localhost:5245/api/usuario/email/${projectData.newMemberEmail}`);
      
                if (!response.ok) {
                    toast.error("Usuario no encontrado", { description: "El correo no está registrado" });
                    return;
                }
      
                const usuario = await response.json();
      
                // Verificar si ya está en la lista
                const yaExiste = projectData.additionalMembers?.some((m: any) => m.id === usuario.id);
                if (yaExiste) {
                  toast.error("Usuario ya agregado");
                  return;
                 }

                // Actualizar también idMiembros (array de IDs)
                projectData.memberIds.push(usuario.id);

                // Agregar el usuario con su ID
                const newMembers = [...(projectData.additionalMembers || []), { 
                  id: usuario.id, 
                  email: usuario.email || projectData.newMemberEmail 
                }];
      
                setProjectData((prev: any) => ({ 
                ...prev, 
                 additionalMembers: newMembers,
                newMemberEmail: "" 
                }));
      
             toast.success(`Usuario ${usuario.email || projectData.newMemberEmail} agregado`);
      
            } catch (error) {
                
                console.error("Error al buscar usuario:", error);
                toast.error("Error al buscar usuario");
            }
        } else {
            toast.error("Correo inválido");
        }
    }}
      className="border-purple-300 text-purple-600 hover:bg-purple-50"
    >
      Agregar
    </Button>
  </div>
  <p className="text-xs text-gray-500 mt-2">
    Tú + {projectData.additionalMembers?.length || 0} miembros adicionales
  </p>
  <p className="text-xs text-gray-500 mt-2">Agrega a los miembros de tu equipo por correo electrónico</p>
</div>

                <div className="flex justify-end">
                  <Button 
                    onClick={handleContinue}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Resumen del proyecto (solo se muestra después de continuar) */
          <Card className="border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                Paso 1: Tu Proyecto
                <Badge className="bg-purple-600 ml-2">
                  <Check className="w-3 h-3 mr-1" />
                  Creado
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gradient-to-r from-purple-50 to-white rounded-2xl p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-5xl shadow-lg">
                    {imagePreview ? (
                      <img src={imagePreview} alt={projectData.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      "🚀"
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl mb-2">{projectData.name}</h3>
                    <p className="text-gray-700 mb-3">{projectData.description}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{1 + (projectData.additionalMembers?.length || 0)} miembros</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setProjectCreated(false);
                      setProjectData({ name: "", description: "", team: 1, memberIds: projectData.memberIds });
                      setImagePreview(null);
                      setSelectedImage(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Paso 2: Seleccionar Categoría (solo visible después de crear proyecto) */}
        {categories.length > 0 && projectCreated && (
          <Card className="border-purple-200 shadow-lg animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Paso 2: Selecciona la Categoría del Evento
                {selectedCategory && (
                  <Badge className="bg-purple-600 ml-2">
                    <Check className="w-3 h-3 mr-1" />
                    Seleccionado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(categories as any[]).map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      bg-gradient-to-br from-white to-purple-50 border-2 rounded-2xl p-6
                      hover:shadow-xl transition-all cursor-pointer
                      ${selectedCategory === category.id
                        ? "border-purple-600 shadow-lg ring-4 ring-purple-200"
                        : "border-purple-100 hover:border-purple-300"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center
                          ${selectedCategory === category.id ? "bg-purple-600" : "bg-purple-100"}
                        `}>
                          <Target className={`w-6 h-6 ${selectedCategory === category.id ? "text-white" : "text-purple-600"}`} />
                        </div>
                        <div>
                          <h4 className="text-xl">{category.name}</h4>
                          <Badge variant="outline" className={`mt-1 ${category.status === "active" ? "border-green-300 text-green-700 bg-green-50" : "border-gray-300 text-gray-600"}`}>
                            {category.status === "active" ? "Activa" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                      {selectedCategory === category.id && (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen y Botón de Registro */}
        {projectCreated && (selectedCategory || categories.length === 0) && (
          <Card className="border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 animate-in slide-in-from-bottom duration-700">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl mb-4">Resumen del Registro</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Proyecto:</span>
                      <span className="text-gray-700">{projectData.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Categoría:</span>
                      <span className="text-gray-700">{(categories as any[]).find((c: any) => c.id === selectedCategory)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Evento:</span>
                      <span className="text-gray-700">{eventConfig.eventName} ({eventConfig.eventCode})</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={!isReadyToRegister}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Registrar Proyecto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
