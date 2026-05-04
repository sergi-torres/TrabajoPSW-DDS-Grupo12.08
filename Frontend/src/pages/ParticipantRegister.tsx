import { ArrowLeft, Check, Target, Calendar, Users, Upload, X, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useState, useEffect, useContext } from "react"; 
import { useVoting } from "../context/VotingContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { createProyecto } from "../api/proyectoApi";
import { EventSidebar } from "../components/layout/EventSidebar";
import { EventContext } from "../context/EventContext";
import { AuthContext } from "../context/AuthContext";
import { cn } from "../components/ui/utils";


export default function RegisterParticipant() {
  const navigate = useNavigate();
  const { eventoId: eventIdFromUrl } = useParams();
  const { categories, eventConfig } = useVoting();
  const eventContext = useContext(EventContext);
  

  const [localCategories, setLocalCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>({
    name: "",
    description: "",
    team: 1,
    memberIds: [],
    additionalMembers: [],
    newMemberEmail: ""
  });

  const [proyectosUsuario, setProyectosUsuario] = useState<ProyectoUsuario[]>([]);

  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const response = await fetch(`http://localhost:5245/api/proyectos/participante/${userId}`);
          if (response.ok) {
            const proyectos = await response.json();
            setProyectosUsuario(proyectos);
            console.log("Proyectos del usuario:", proyectos);
          }
        }
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      }
    };

    cargarProyectos();
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId && projectData.memberIds.length === 0) {
      setProjectData((prev) => ({
        ...prev,
        memberIds: [parseInt(userId)]
      }));
    }
  }, []); // Solo se ejecuta una vez al montar

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
    if (projectCreated && (localCategories.length === 0 || selectedCategory)) {
      try {
        const userId = localStorage.getItem("userId");
        const eventoId = eventIdFromUrl || localStorage.getItem("eventoId");      

        const newProject = {
          nombre: projectData.name,
          descripcion: projectData.description,
          urlMultimedia: "🚀", // No enviamos el Base64 porque supera los 500 caracteres del VARCHAR en DB
          idEvento: eventoId ? parseInt(eventoId) : null,
          idParticipante: userId ? parseInt(userId) : 16,
          idCategoria: selectedCategory ? parseInt(selectedCategory) : null,
          idMiembros : projectData.memberIds,
          estado: "disponible"
        };

        const res = await createProyecto(newProject);
        console.log("Proyecto creado:", res);
        
        localStorage.setItem("proyectoABCD", JSON.stringify(res));

        const catName = localCategories.find((c: any) => c.id === selectedCategory)?.nombre || "N/A";
        toast.success(`Proyecto registrado exitosamente!\n\nProyecto: ${projectData.name}\nCategoría: ${catName}`);
        navigate("/eventos");
      } catch (error: any) {
        console.error("Error al crear el proyecto:", error);
        toast.error("Error al crear proyecto", { description: error.message });
      }
    }
  };
;

  const isReadyToRegister = projectCreated && (selectedCategory || localCategories.length === 0);
  const isCollapsed = eventContext?.isCollapsed ?? false;
  const userRole = eventContext?.userRole ?? "Participante";
  
  // Determinar si es público de forma robusta
  const effectivelyPublic = userRole === "Público";

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar />
      
      <div className="pb-[88px] lg:pb-12">
        {/* Header - Full Width Background */}
        <header 
          className={cn(
            "text-white p-6 lg:p-10 transition-all duration-300",
            effectivelyPublic ? "lg:pl-10" : (isCollapsed ? "lg:pl-28" : "lg:pl-80")
          )}
          style={{ background: "linear-gradient(to right, #9333ea, #7e22ce)" }}
        >
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/eventos")}
              className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity bg-white/10 px-4 py-2 rounded-xl font-heading font-semibold text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Volver
            </button>
            <div>
              <h1 className="text-4xl font-heading font-bold mb-2 tracking-tight">Registrar Proyecto</h1>
              <p className="text-purple-100 text-lg font-medium opacity-90">Crea tu proyecto para {eventConfig?.eventName || "el evento"}</p>
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-10 space-y-8 transition-all duration-300",
          effectivelyPublic ? "" : (isCollapsed ? "lg:pl-28" : "lg:pl-80")
        )}>
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
      {(() => {
        const categoriasOcupadas = proyectosUsuario.map(p => p.idCategoria).filter(Boolean);
        const hayCategoriasDisponibles = categories.some(cat => 
          cat.status === "pending" && 
          !categoriasOcupadas.includes(cat.id)
        );
        
        return hayCategoriasDisponibles ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => {
              const isActive = category.status === "pending";
              const yaTieneProyecto = categoriasOcupadas.includes(category.id);
              const isSelectable = isActive && !yaTieneProyecto;
              const isSelected = selectedCategory === category.id;
              
              return (
                <div
                  key={category.id}
                  onClick={() => isSelectable && setSelectedCategory(category.id)}
                  className={`
                    bg-gradient-to-br from-white to-purple-50 border-2 rounded-2xl p-6
                    transition-all cursor-pointer
                    ${!isSelectable && "opacity-60 cursor-not-allowed"}
                    ${isSelectable && "hover:shadow-xl"}
                    ${isSelected && isSelectable
                      ? "border-purple-600 shadow-lg ring-4 ring-purple-200"
                      : "border-purple-100 hover:border-purple-300"
                    }
                    ${!isSelectable && "border-gray-200 bg-gray-50"}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`
                        w-12 h-12 rounded-xl flex items-center justify-center
                        ${isSelected && isSelectable ? "bg-purple-600" : !isSelectable ? "bg-gray-300" : "bg-purple-100"}
                      `}>
                        <Target className={`w-6 h-6 ${
                          isSelected && isSelectable ? "text-white" : !isSelectable ? "text-gray-500" : "text-purple-600"
                        }`} />
                      </div>
                      <div>
                        <h4 className={`text-xl ${!isSelectable && "text-gray-500"}`}>{category.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`${
                              isActive 
                                ? "border-green-300 text-green-700 bg-green-50"
                                : "border-gray-300 text-gray-500 bg-gray-100"
                            }`}
                          >
                            {isActive ? "Activa" : "Pendiente"}
                          </Badge>
                          {yaTieneProyecto && (
                            <Badge 
                              variant="outline" 
                              className="border-orange-300 text-orange-700 bg-orange-50"
                            >
                              Ya tienes proyecto
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && isSelectable && (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay categorías disponibles
            </h3>
            <p className="text-gray-500">
              {categoriasOcupadas.length > 0 && categories.some(c => c.status === "pending")
                ? "Ya tienes un proyecto registrado en todas las categorías activas."
                : "En estos momentos no hay categorías activas para este evento."}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {categoriasOcupadas.length > 0 && categories.some(c => c.status === "pending")
                ? "Solo puedes registrar un proyecto por categoría."
                : "Por favor, espera a que el organizador habilite las categorías."}
            </p>
          </div>
        );
      })()}
    </CardContent>
  </Card>
)}

{/* Resumen Final - SOLO si hay categorías disponibles Y hay una categoría seleccionada */}
{projectCreated && selectedCategory && (() => {
  const categoriasOcupadas = proyectosUsuario.map(p => p.idCategoria).filter(Boolean);
  const hayCategoriasDisponibles = categories.some(cat => 
    cat.status === "pending" && 
    !categoriasOcupadas.includes(cat.id)
  );
  return hayCategoriasDisponibles && selectedCategory;
})() && (
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

        </main>
      </div>
    </div>
  );
}
