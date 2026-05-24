import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, HelpCircle, Target, Scale, Award } from "lucide-react";
import StepIndicator from "../components/createEvent/StepIndicator";
import StepDetalles from "../components/createEvent/StepDetalles";
import StepVotaciones from "../components/createEvent/StepVotaciones";
import StepReglas from "../components/createEvent/StepReglas";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { getEventoDetalle, updateEvento } from "../api/eventosApi";
import { EventSidebar } from "../components/layout/EventSidebar";
import { InfoModal } from "../components/layout/InfoModal";
import { EventContext } from "../context/EventContext";
import { cn } from "../components/ui/utils";
import { useVoting } from "../context/VotingContext";
import ConfigHelpPanel from "../components/ui/ConfigHelpPanel";

const steps = [
  { number: 1, label: "Detalles" },
  { number: 2, label: "Reglas" },
  { number: 3, label: "Votaciones" },
];

const CreateEvent = () => {
  const { userId } = useContext(AuthContext)!;
  const { userColor, isCollapsed, userRole } = useContext(EventContext)!;
  const { addNotification } = useVoting();
  const navigate = useNavigate();
  const { eventoId } = useParams();

  // Modo edición si hay un eventoId en la URL
  const isEditMode = Boolean(eventoId);
  const isPublicRole = userRole === "Público";
  
  // Offset logic matching OrganizerDashboard/VotosPage
  const sidebarOffsetClass = isPublicRole ? "" : (isCollapsed ? "lg:pl-28" : "lg:pl-80");

  const [currentStep, setCurrentStep] = useState(1);
  const [loadingEvento, setLoadingEvento] = useState(false);
  const [eventoEstado, setEventoEstado] = useState("");
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [detalles, setDetalles] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    imagen: null,
  });

  const [votacion, setVotacion] = useState<{
    votoPublicoHabilitado: boolean;
    pesoJurado: number;
    categorias: any[];
    comentariosObligatorios: boolean;
  }>({
    votoPublicoHabilitado: true,
    pesoJurado: 70,
    categorias: [],
    comentariosObligatorios: false
  });

  const [reglas, setReglas] = useState({
    plantilla: "",
    baremoNombre: "",
    dimensiones: [],
    analisisAutomatico: false,
  });

  // Cargar datos del evento en modo edición
  useEffect(() => {
    if (!isEditMode) return;

    const loadEvento = async () => {
      try {
        setLoadingEvento(true);
        const data = await getEventoDetalle(Number(eventoId));

        setEventoEstado(data.estado);

        // Prellenar detalles
        setDetalles({
          nombre: data.nombre || "",
          descripcion: data.descripcion || "",
          fechaInicio: data.fechaInicio ? new Date(data.fechaInicio).toISOString().slice(0, 16) : "",
          fechaFin: data.fechaFin ? new Date(data.fechaFin).toISOString().slice(0, 16) : "",
          imagen: null,
        });

        // Prellenar votación
        const categorias = (data.categorias || []).map((c: any) => c.nombre);
        const pesoJurado = data.categorias?.[0]?.pesos?.find((p: any) => p.rolVotante === "Jurado")?.peso ?? 70;
        const pesoPublico = data.categorias?.[0]?.pesos?.find((p: any) => p.rolVotante === "Publico")?.peso ?? 30;

        setVotacion({
          votoPublicoHabilitado: pesoPublico > 0,
          pesoJurado: pesoJurado,
          categorias: categorias.length > 0 && categorias[0] !== "Global" ? categorias : [],
          comentariosObligatorios: data.comentariosObligatorios ?? false,
        });

        // Prellenar reglas/baremos
        const baremo = data.baremos?.[0];
        if (baremo) {
          const dimensiones = (baremo.criterios || []).map((c: any) => ({
            id: crypto.randomUUID(),
            nombre: c.nombre,
            peso: c.peso,
            comentarioObligatorio: c.comentarioObligatorio ?? false
          }));

          let plantillaDetectada = "custom";
          if (baremo.nombre === "Hackathon estándar") plantillaDetectada = "hackathon";
          else if (baremo.nombre === "Pitch Competition") plantillaDetectada = "pitch";
          else if (baremo.nombre === "Feria de Innovación") plantillaDetectada = "feria";

          setReglas({
            plantilla: plantillaDetectada,
            baremoNombre: baremo.nombre,
            dimensiones,
            analisisAutomatico: false,
          });
        }
      } catch (err: any) {
        toast.error("Error al cargar el evento", { description: err.message });
        navigate("/eventos");
      } finally {
        setLoadingEvento(false);
      }
    };

    loadEvento();
  }, [eventoId, isEditMode, navigate]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!detalles.nombre.trim() || !detalles.fechaInicio || !detalles.fechaFin) {
        toast.error("Faltan campos obligatorios", { description: "Por favor, rellena todos los campos con asterisco en esta sección." });
        return;
      }
      const inicio = new Date(detalles.fechaInicio);
      const fin = new Date(detalles.fechaFin);
      if (inicio >= fin) {
        toast.error("Fechas inválidas", { description: "La fecha de inicio debe ser estrictamente anterior a la fecha de fin." });
        return;
      }
    }
    
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      if (!detalles.nombre.trim()) throw new Error("El nombre del evento es obligatorio.");
      if (!detalles.fechaInicio) throw new Error("La fecha de inicio es obligatoria.");
      if (!detalles.fechaFin) throw new Error("La fecha de fin es obligatoria.");

      const inicio = new Date(detalles.fechaInicio);
      const fin = new Date(detalles.fechaFin);
      if (inicio >= fin) throw new Error("La fecha de inicio debe ser anterior a la fecha de fin.");

      if (reglas.dimensiones.length > 0) {
        const totalPeso = reglas.dimensiones.reduce((sum, d) => sum + (d as any).peso, 0);
        if (totalPeso !== 100) throw new Error(`La suma de los pesos de las dimensiones debe ser 100% (actual: ${totalPeso}%).`);
      }

      const tipoEvento =
        reglas.plantilla === "hackathon" ? "Hackaton"
        : reglas.plantilla === "pitch" ? "Evento Pequeño"
        : "Feria";

      const baremoNombre = reglas.baremoNombre || reglas.plantilla || "Personalizado";
      const baremos = reglas.dimensiones.length > 0
        ? [{
            nombre: baremoNombre,
            criterios: reglas.dimensiones.map((d: any) => ({
              nombre: d.nombre,
              tipoCriterio: "Numerico",
              peso: d.peso,
              comentarioObligatorio: d.comentarioObligatorio ?? false
            })),
          }]
        : [];

      const categoriasFinales = [
        ...new Set(
          votacion.categorias.length === 0
            ? ["Global"]
            : votacion.categorias
        )
      ];

      if (isEditMode) {
        const updateBody = {
          nombre: detalles.nombre,
          descripcion: detalles.descripcion,
          fechaInicio: inicio.toISOString(),
          fechaFin: fin.toISOString(),
          tipoEvento,
          baremos,
          categorias: categoriasFinales.map(nombre => ({
            nombre,
            idEvento: parseInt(eventoId!),
            pesos: [
              { rolVotante: "Jurado", peso: votacion.pesoJurado },
              { rolVotante: "Publico", peso: 100 - votacion.pesoJurado },
            ],
          })),
          votoPublicoHabilitado: votacion.votoPublicoHabilitado,
          pesoJurado: votacion.pesoJurado,
          comentariosObligatorios: votacion.comentariosObligatorios,
        };

        await updateEvento(Number(eventoId), updateBody);
        toast.success("Evento actualizado exitosamente");
        navigate(`/eventos/${eventoId}`);
        return;
      }

      const body = {
        nombre: detalles.nombre,
        descripcion: detalles.descripcion,
        fechaInicio: inicio.toISOString(),
        fechaFin: fin.toISOString(),
        tipoEvento,
        idOrganizador: userId,
        codEvento: Math.floor(100000 + Math.random() * 900000),
        comentariosObligatorios: votacion.comentariosObligatorios,
        baremos,
        categorias: categoriasFinales.map(nombre => ({
          nombre,
          pesos: [
            { rolVotante: "Jurado", peso: votacion.pesoJurado },
            { rolVotante: "Publico", peso: 100 - votacion.pesoJurado }
          ]
        }))
      };

      const response = await fetch("http://localhost:5245/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Error al crear el evento");

      toast.success("Evento creado exitosamente");

      addNotification("event_created", "Evento creado");

      navigate("/eventos");

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCtrlEnter = (e: React.KeyboardEvent<HTMLDivElement> | KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (currentStep < 3) {
        handleNext();
      } else {
        handlePublish();
      }
    }
  };

  useEffect(() => {
    const onGlobalKeyDown = (event: KeyboardEvent) => handleCtrlEnter(event);
    window.addEventListener("keydown", onGlobalKeyDown);
    return () => window.removeEventListener("keydown", onGlobalKeyDown);
  }, [currentStep, handleNext, handlePublish]);

  const readOnlyBaremos = isEditMode && (eventoEstado === "Activo" || eventoEstado === "EnVotacion");

  if (loadingEvento) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        {isEditMode && <EventSidebar />}
        <div className={cn("flex flex-col items-center gap-4 transition-all duration-300", sidebarOffsetClass)}>
          <Loader2 className="w-10 h-10 text-org animate-spin" />
          <p className="font-heading font-bold text-gray-400 text-sm tracking-widest uppercase">Cargando Ajustes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body relative" onKeyDown={handleCtrlEnter}>
      {isEditMode && !isPublicRole && <EventSidebar />}

      <div className="pb-[88px] lg:pb-0">
        {/* Full-width Header for Settings matching OrganizerDashboard */}
        <header 
          className={cn(
            "text-white p-6 lg:p-10 transition-all duration-300",
            sidebarOffsetClass
          )}
          style={{ backgroundColor: userColor || undefined }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <button
                onClick={() => navigate(isEditMode ? `/eventos/${eventoId}` : '/eventos')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                {isEditMode ? "Volver al Panel" : "Volver a eventos"}
              </button>
              
              <button
                onClick={() => setShowHelpModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-heading font-bold text-sm shadow-md active:scale-95"
              >
                <HelpCircle className="w-4 h-4" />
                Ayuda
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    {isEditMode ? "Configuración de Evento" : "Nuevo Evento"}
                  </span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-heading font-bold tracking-tight mb-2">
                  {isEditMode ? "Ajustes" : "Crear Evento"}
                </h1>
                <p className="text-blue-100 text-lg font-medium opacity-90">
                  {currentStep === 1 && "Define el nombre, descripción y fechas del evento."}
                  {currentStep === 2 && "Configura los baremos y criterios de evaluación."}
                  {currentStep === 3 && "Establece las reglas de votación y pesos."}
                </p>
              </div>

              {/* Progress Indicator in Header */}
              <div className="bg-white/10 backdrop-blur-md rounded-[32px] p-2 border border-white/20 hidden md:block">
                <div className="flex gap-2">
                  {steps.map((s) => (
                    <div
                      key={s.number}
                      className={cn(
                        "px-6 py-3 rounded-[24px] text-xs font-black uppercase tracking-widest transition-all",
                        currentStep === s.number 
                          ? "bg-white text-blue-600 shadow-sm" 
                          : "text-white/40"
                      )}
                    >
                      {s.number}. {s.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-5xl mx-auto p-6 lg:p-10 -mt-10 space-y-8 transition-all duration-300",
          sidebarOffsetClass
        )}>
          {/* Mobile Step Indicator */}
          <div className="md:hidden">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 sm:p-10 mb-8">
            {currentStep === 1 && <StepDetalles data={detalles} onChange={setDetalles} />}
            {currentStep === 2 && <StepReglas data={reglas} onChange={setReglas} readOnlyBaremos={readOnlyBaremos} />}
            {currentStep === 3 && <StepVotaciones data={votacion} onChange={setVotacion} />}
          </div>

          <div className="flex justify-between items-center pb-20">
            <button
              onClick={() => currentStep === 1 ? (isEditMode ? navigate(`/eventos/${eventoId}`) : navigate("/eventos")) : handlePrev()}
              className="flex items-center gap-2 h-14 px-8 rounded-2xl font-heading font-bold border-2 border-gray-100 bg-white text-gray-500 hover:bg-gray-50 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
              {currentStep === 1 ? "Cancelar" : "Anterior"}
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 h-14 px-10 rounded-2xl font-heading font-bold bg-org text-white hover:opacity-90 shadow-lg shadow-blue-100 transition-all active:scale-95"
              >
                Siguiente
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex items-center gap-2 h-14 px-10 rounded-2xl font-heading font-bold bg-emerald-500 text-white hover:opacity-90 shadow-lg shadow-emerald-100 transition-all active:scale-95 disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="w-5 h-5 animate-spin" /> : (isEditMode ? "Guardar Cambios" : "Publicar Evento")}
                <Check className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* Floating config help panel */}
      <ConfigHelpPanel />
      <InfoModal
        isOpen={showHelpModal}
        title="Guía de Creación de Eventos"
        onClose={() => setShowHelpModal(false)}
      >
        <div className="space-y-8">
          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target size={20} className="text-blue-600" />
              </div>
              <h3 className="font-heading font-bold text-lg">1. Detalles del Evento</h3>
            </div>
            <p className="text-sm">
              El <strong>nombre</strong> y la <strong>descripción</strong> son la carta de presentación. Asegúrate de que las fechas sean correctas: el sistema no permitirá que el evento termine antes de empezar. Una buena imagen de portada aumenta la participación en un 40%.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-org/10">
                <Award size={20} className="text-org" />
              </div>
              <h3 className="font-heading font-bold text-lg">2. Baremos y Criterios</h3>
            </div>
            <p className="text-sm">
              Los <strong>baremos</strong> son las reglas del juego. Cada criterio (ej: Innovación, Diseño) debe tener un peso. 
              <span className="block mt-2 p-3 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-r-lg">
                <strong>Importante:</strong> La suma de todos los pesos debe ser exactamente <strong>100%</strong>.
              </span>
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Scale size={20} className="text-emerald-600" />
              </div>
              <h3 className="font-heading font-bold text-lg">3. Configuración de Votación</h3>
            </div>
            <p className="text-sm">
              Aquí decides quién tiene más poder. El <strong>Peso del Jurado</strong> determina cuánto influye su voto frente al del público. Si habilitas categorías, los proyectos se agruparán para una competencia más justa.
            </p>
          </section>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <p className="text-xs text-slate-500 italic">
              Heurística aplicada: "Ayuda y documentación". Solo mostramos lo necesario para prevenir errores de configuración y asegurar que el evento sea equilibrado.
            </p>
          </div>
        </div>
      </InfoModal>
    </div>
  );
};

export default CreateEvent;
