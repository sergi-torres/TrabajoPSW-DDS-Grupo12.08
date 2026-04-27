import { ArrowLeft, Check, Target, Calendar, Users, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router";
import { useState, useEffect, useContext } from "react"; 
import { useVoting } from "../context/VotingContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { createProyecto } from "../api/proyectoApi";
import { EventSidebar } from "../components/layout/EventSidebar";
import { EventContext } from "../context/EventContext";

export default function RegisterParticipant() {
  const navigate = useNavigate();
  const { categories, eventConfig } = useVoting();
  const eventContext = useContext(EventContext);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>({
    name: "",
    description: "",
    team: 1,
    memberIds: [],
    additionalMembers: [],
    newMemberEmail: ""
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
        
        localStorage.setItem("proyectoABCD", JSON.stringify(res));

        toast.success(`Proyecto registrado exitosamente!\n\nProyecto: ${projectData.name}\nCategoría: ${categories.find((c: any) => c.id === selectedCategory)?.name}`);
        navigate("/eventos");
      } catch (error: any) {
        console.error("Error al crear el proyecto:", error);
        toast.error("Error al crear proyecto", { description: error.message });
      }
    }
  };

  const isReadyToRegister = projectCreated && (selectedCategory || categories.length === 0);
  const isCollapsed = eventContext?.isCollapsed ?? false;
  const userRole = eventContext?.userRole ?? "Participante";

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative">
      <EventSidebar />
      
      <div className={`transition-all duration-300 ${isCollapsed ? "lg:pl-28" : "lg:pl-80"}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/eventos")}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity bg-white/10 px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver
            </button>
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2">Registrar Proyecto</h1>
              <p className="text-purple-100 text-lg">Crea tu proyecto para {eventConfig?.eventName || "el evento"}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6 lg:p-10 space-y-6">
          {/* Paso 1: Crear Proyecto */}
          {!projectCreated ? (
            <Card className="border-purple-200 shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b border-purple-50">
                <CardTitle className="flex items-center gap-2 text-2xl font-heading font-bold text-gray-900">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                  Paso 1: Crea tu Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
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
                      <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors font-bold">
                        <Upload className="w-4 h-4" />
                        <span>{imagePreview ? "Cambiar imagen" : "Subir imagen"}</span>
                      </div>
                    </label>
                  </div>

                  {/* Nombre del Proyecto */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                      Nombre del Proyecto *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={projectData.name}
                      onChange={handleInputChange}
                      placeholder="Ej: Votify Platform"
                      className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      value={projectData.description}
                      onChange={handleInputChange}
                      placeholder="Describe tu proyecto..."
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    />
                  </div>

                  {/* Participantes del Proyecto */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4 ml-1">
                      <Users className="w-4 h-4 inline mr-2 text-purple-600" />
                      Equipo ({1 + (projectData.additionalMembers?.length || 0)} miembros)
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Participante actual */}
                      <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-200 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                          {localStorage.getItem("email")?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 truncate">{localStorage.getItem("email") || "Usuario"}</p>
                          <p className="text-[10px] text-purple-600 uppercase font-black tracking-widest">Tú (Creador)</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 font-bold border-none">Líder</Badge>
                      </div>

                      {/* Lista de participantes adicionales */}
                      {projectData.additionalMembers?.map((member: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm animate-in zoom-in-95">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold">
                            {member.email?.charAt(0).toUpperCase() || "M"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{member.email}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Miembro</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newMembers = [...projectData.additionalMembers];
                              newMembers.splice(index, 1);
                              const newIds = [...projectData.memberIds];
                              newIds.splice(index + 1, 1);
                              setProjectData((prev: any) => ({ ...prev, additionalMembers: newMembers, memberIds: newIds }));
                            }}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Botón para agregar más participantes */}
                    <div className="flex gap-2 mt-6">
                      <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={projectData.newMemberEmail || ""}
                        onChange={(e) => setProjectData((prev: any) => ({ ...prev, newMemberEmail: e.target.value }))}
                        className="flex-1 px-4 py-3 bg-gray-50 border border-purple-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-sm"
                      />
                      <Button
                        type="button"
                        onClick={async () => {
                          if (projectData.newMemberEmail && projectData.newMemberEmail.includes("@")) {
                              try {
                                  const response = await fetch(`http://localhost:5245/api/usuario/email/${projectData.newMemberEmail}`);
                                  if (!response.ok) {
                                      toast.error("Usuario no encontrado", { description: "El correo no está registrado en Votify" });
                                      return;
                                  }
                                  const usuario = await response.json();
                                  const yaExiste = projectData.memberIds.includes(usuario.id);
                                  if (yaExiste) {
                                    toast.error("Usuario ya está en el equipo");
                                    return;
                                  }

                                  setProjectData((prev: any) => ({ 
                                    ...prev, 
                                    memberIds: [...prev.memberIds, usuario.id],
                                    additionalMembers: [...(prev.additionalMembers || []), { id: usuario.id, email: usuario.email || projectData.newMemberEmail }],
                                    newMemberEmail: "" 
                                  }));
                                  toast.success(`¡${usuario.nombrecompleto || usuario.email} añadido al equipo!`);
                              } catch (error) {
                                  console.error("Error al buscar usuario:", error);
                                  toast.error("Error al conectar con el servidor");
                              }
                          } else {
                              toast.error("Introduce un correo válido");
                          }
                        }}
                        className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-6 rounded-2xl font-bold"
                      >
                        Añadir
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleContinue}
                      className="bg-purple-600 hover:bg-purple-700 px-8 py-6 rounded-2xl font-bold shadow-lg shadow-purple-100 active:scale-95 transition-all"
                    >
                      Siguiente paso
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Resumen del proyecto */
            <Card className="border-purple-200 shadow-lg rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4">
              <CardHeader className="p-8 border-b border-purple-50 flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-2xl font-heading font-bold text-gray-900">
                  <ImageIcon className="w-6 h-6 text-purple-600" />
                  Tu Proyecto
                </CardTitle>
                <Badge className="bg-green-500 text-white border-none py-1.5 px-4 rounded-full font-bold">
                  <Check className="w-4 h-4 mr-1" />
                  Listo para registrar
                </Badge>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-[32px] p-8 border border-purple-100">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-5xl shadow-xl overflow-hidden border-4 border-white">
                      {imagePreview ? (
                        <img src={imagePreview} alt={projectData.name} className="w-full h-full object-cover" />
                      ) : (
                        "🚀"
                      )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-3xl font-heading font-bold text-gray-900 mb-2">{projectData.name}</h3>
                      <p className="text-gray-600 text-lg mb-6 leading-relaxed">{projectData.description}</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-purple-50">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-gray-700 text-sm">{1 + (projectData.additionalMembers?.length || 0)} miembros</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setProjectCreated(false)}
                      className="p-3 bg-white text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all shadow-sm border border-gray-100"
                      title="Editar proyecto"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paso 2: Seleccionar Categoría */}
          {categories.length > 0 && projectCreated && (
            <Card className="border-purple-200 shadow-lg rounded-3xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
              <CardHeader className="p-8 border-b border-purple-50">
                <CardTitle className="flex items-center gap-2 text-2xl font-heading font-bold text-gray-900">
                  <Target className="w-6 h-6 text-purple-600" />
                  Paso 2: Categoría del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(categories as any[]).map((category) => (
                    <div
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`
                        relative group rounded-[32px] p-6 transition-all duration-300 cursor-pointer border-2
                        ${selectedCategory === category.id
                          ? "bg-purple-600 border-purple-600 shadow-xl shadow-purple-100 -translate-y-1"
                          : "bg-white border-gray-50 hover:border-purple-200 hover:shadow-lg"
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-14 h-14 rounded-2xl flex items-center justify-center transition-colors
                          ${selectedCategory === category.id ? "bg-white/20" : "bg-purple-50"}
                        `}>
                          <Target className={`w-7 h-7 ${selectedCategory === category.id ? "text-white" : "text-purple-600"}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-xl font-bold ${selectedCategory === category.id ? "text-white" : "text-gray-900"}`}>
                            {category.name}
                          </h4>
                          <Badge variant="outline" className={`mt-1 font-bold border-none px-0 ${selectedCategory === category.id ? "text-purple-100" : "text-gray-400"}`}>
                             Participar aquí
                          </Badge>
                        </div>
                        {selectedCategory === category.id && (
                          <div className="bg-white text-purple-600 rounded-full p-1.5">
                            <Check className="w-5 h-5" strokeWidth={3} />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Resumen Final */}
          {projectCreated && (selectedCategory || categories.length === 0) && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <button
                onClick={handleRegister}
                disabled={!isReadyToRegister}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white p-8 rounded-[32px] shadow-2xl shadow-purple-200 transition-all hover:scale-[1.01] active:scale-95 group"
              >
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  <div className="text-left">
                    <p className="text-purple-200 text-sm font-black uppercase tracking-widest mb-1">Finalizar Registro</p>
                    <h3 className="text-3xl font-heading font-bold">Inscribir "{projectData.name}"</h3>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Check className="w-8 h-8 text-white" strokeWidth={3} />
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
