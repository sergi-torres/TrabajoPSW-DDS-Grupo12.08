import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import StepIndicator from "../components/createEvent/StepIndicator";
import StepDetalles from "../components/createEvent/StepDetalles";
import StepVotaciones from "../components/createEvent/StepVotaciones";
import StepReglas from "../components/createEvent/StepReglas";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";
import { getEventoDetalle, updateEvento } from "../api/eventosApi";

const steps = [
  { number: 1, label: "Detalles" },
  { number: 2, label: "Reglas" },
  { number: 3, label: "Votaciones" },
];

const CreateEvent = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const { eventoId } = useParams();

  // Modo edición si hay un eventoId en la URL
  const isEditMode = Boolean(eventoId);

  const [currentStep, setCurrentStep] = useState(1);
  const [loadingEvento, setLoadingEvento] = useState(false);
  const [eventoEstado, setEventoEstado] = useState("");

  const [detalles, setDetalles] = useState({
    nombre: "",
    descripcion: "",
    fechaInicio: "",
    fechaFin: "",
    imagen: null,
  });

  const [votacion, setVotacion] = useState({
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
        const data = await getEventoDetalle(eventoId);

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
        const categorias = (data.categorias || []).map(c => c.nombre);
        const pesoJurado = data.categorias?.[0]?.pesos?.find(p => p.rolVotante === "Jurado")?.peso ?? 70;
        const pesoPublico = data.categorias?.[0]?.pesos?.find(p => p.rolVotante === "Publico")?.peso ?? 30;

        setVotacion({
          votoPublicoHabilitado: pesoPublico > 0,
          pesoJurado: pesoJurado,
          categorias: categorias.length > 0 && categorias[0] !== "Global" ? categorias : [],
          comentariosObligatorios: data.comentariosObligatorios ?? false,
        });

        // Prellenar reglas/baremos
        const baremo = data.baremos?.[0];
        if (baremo) {
          const dimensiones = (baremo.criterios || []).map(c => ({
            id: crypto.randomUUID(),
            nombre: c.nombre,
            peso: c.peso,
            comentarioObligatorio: c.comentarioObligatorio || false,
          }));

          // Intentar detectar si es una plantilla predefinida
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
      } catch (err) {
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

  //Bloqueo de doble submit mientras se procesa la publicación del evento
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    if (isPublishing) return;
    setIsPublishing(true);

    try {
      // VALIDACIONES
      if (!detalles.nombre.trim()) {
        throw new Error("El nombre del evento es obligatorio.");
      }

      if (!detalles.fechaInicio) {
        throw new Error("La fecha de inicio es obligatoria.");
      }

      if (!detalles.fechaFin) {
        throw new Error("La fecha de fin es obligatoria.");
      }

      const inicio = new Date(detalles.fechaInicio);
      const fin = new Date(detalles.fechaFin);

      if (inicio >= fin) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin.");
      }

      // Validar que las dimensiones sumen 100% si hay alguna
      if (reglas.dimensiones.length > 0) {
        const totalPeso = reglas.dimensiones.reduce((sum, d) => sum + d.peso, 0);
        if (totalPeso !== 100) {
          throw new Error(`La suma de los pesos de las dimensiones debe ser 100% (actual: ${totalPeso}%).`);
        }
      }

      // TIPO EVENTO (Común para creación y edición)
      const tipoEvento =
        reglas.plantilla === "hackathon" ? "Hackaton"
        : reglas.plantilla === "pitch" ? "Evento Pequeño"
        : "Feria";

      // MODO EDICIÓN: Actualizar evento existente
      if (isEditMode) {
        // Construir baremos con criterios
        const baremoNombre = reglas.baremoNombre || reglas.plantilla || "Personalizado";
        const baremos = reglas.dimensiones.length > 0
          ? [{
              nombre: baremoNombre,
              criterios: reglas.dimensiones.map(d => ({
                nombre: d.nombre,
                tipoCriterio: "Numerico",
                peso: d.peso,
                comentarioObligatorio: d.comentarioObligatorio || false,
              })),
            }]
          : [];

        // Construir categorías
        const categoriasFinales = votacion.categorias.length === 0
          ? ["Global"]
          : [...new Set(votacion.categorias)];

        const updateBody = {
          nombre: detalles.nombre,
          descripcion: detalles.descripcion,
          fechaInicio: inicio.toISOString(),
          fechaFin: fin.toISOString(),
          tipoEvento,
          baremos,
          categorias: categoriasFinales.map(nombre => ({
            nombre,
            idEvento: parseInt(eventoId),
            pesos: [
              { rolVotante: "Jurado", peso: votacion.pesoJurado },
              { rolVotante: "Publico", peso: 100 - votacion.pesoJurado },
            ],
          })),
          votoPublicoHabilitado: votacion.votoPublicoHabilitado,
          pesoJurado: votacion.pesoJurado,
          comentariosObligatorios: votacion.comentariosObligatorios,
        };

        await updateEvento(eventoId, updateBody);

        toast.success("Evento actualizado exitosamente", {
          description: `Los cambios en "${detalles.nombre}" se han guardado.`,
        });

        navigate("/organizador-dashboard");
        return;
      }

      // MODO CREACIÓN: Crear nuevo evento

      // NORMALIZAR CATEGORÍAS (CLAVE)
      const categoriasFinales = [
        ...new Set(
          votacion.categorias.length === 0
            ? ["Global"]
            : votacion.categorias
        )
      ];

      // Construir baremos con criterios reales
      const baremoNombre = reglas.baremoNombre || reglas.plantilla || "Personalizado";
      const baremos = reglas.dimensiones.length > 0
        ? [{
            nombre: baremoNombre,
            criterios: reglas.dimensiones.map(d => ({
              nombre: d.nombre,
              tipoCriterio: "Numerico",
              peso: d.peso,
              comentarioObligatorio: d.comentarioObligatorio || false,
            })),
          }]
        : [];

      // BODY EVENTO
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
        categorias: [] //  NO duplicar creación
      };

      // 1. CREAR EVENTO
      const response = await fetch("http://localhost:5245/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data?.error ||
          (data?.errors && data.errors[Object.keys(data.errors)[0]][0]) ||
          "Error al crear el evento";

        throw new Error(errorMessage);
      }

      const newEventoId = data.id;

      // 2. CREAR CATEGORÍAS
      for (const nombre of categoriasFinales) {
        const catResponse = await fetch(
          "http://localhost:5245/api/categorias",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre,
              idEvento: newEventoId,
              pesos: [
                {
                  rolVotante: "Jurado",
                  peso: votacion.pesoJurado
                },
                {
                  rolVotante: "Publico",
                  peso: 100 - votacion.pesoJurado
                }
              ]
            })
          }
        );

        if (!catResponse.ok) {
          let errorText = "";

          try {
            const errJson = await catResponse.json();
            errorText = errJson.message || JSON.stringify(errJson);
          } catch {
            errorText = await catResponse.text();
          }

          throw new Error(`Error creando categoría "${nombre}": ${errorText}`);
        }
      }

      // SUCCESS
      toast.success("Evento creado exitosamente", {
        description: `Tu evento "${data.nombre}" ha sido publicado con ID ${data.id}.`,
      });

      console.log("Categorías creadas:", categoriasFinales);

      navigate("/eventos");

    } catch (error) {
      toast.error(isEditMode ? "Error al actualizar el evento" : "Error al crear el evento", {
        description: error.message,
      });
    } finally {
      setIsPublishing(false);
    }
  };

  // Determinar si los baremos son de solo lectura (evento en votación)
  const readOnlyBaremos = isEditMode && (eventoEstado === "Activo" || eventoEstado === "EnVotacion");

  // Pantalla de carga para modo edición
  if (loadingEvento) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center p-8 bg-card rounded-2xl shadow-base">
          <Loader2 className="w-10 h-10 text-org animate-spin mx-auto mb-4" />
          <p className="text-lg font-heading font-medium text-foreground">Cargando evento...</p>
          <p className="text-sm text-muted-foreground mt-1">Obteniendo configuración actual</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="text-center mt-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {currentStep === 1 && "Detalles del Evento"}
            {currentStep === 2 && "Reglas y Baremos"}
            {currentStep === 3 && "Configuración de Votación"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isEditMode ? "Editando evento" : `Paso ${currentStep} de ${steps.length}`}
          </p>
        </div>

        <div className="bg-card rounded-2xl shadow-votify-base p-6 sm:p-8">
          {currentStep === 1 && <StepDetalles data={detalles} onChange={setDetalles} />}
          {currentStep === 2 && <StepReglas data={reglas} onChange={setReglas} readOnlyBaremos={readOnlyBaremos} />}
          {currentStep === 3 && <StepVotaciones data={votacion} onChange={setVotacion} />}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => currentStep === 1 ? navigate(isEditMode ? "/organizador-dashboard" : "/eventos") : handlePrev()}
            className="flex items-center gap-2 h-12 px-6 rounded-md font-heading font-semibold border border-border bg-background text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? "Cancelar" : "Anterior"}
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 h-12 px-6 rounded-md font-heading font-semibold bg-org text-white hover:brightness-105 hover:scale-[1.02] hover:shadow-hover transition-all duration-[150ms]"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="flex items-center gap-2 h-12 px-6 rounded-md font-heading font-semibold bg-success text-white hover:brightness-105 hover:scale-[1.02] hover:shadow-hover transition-all duration-[150ms] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditMode ? "Guardando..." : "Publicando..."}
                </>
              ) : (
                <>
                  {isEditMode ? "Guardar Cambios" : "Publicar Evento"}
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
