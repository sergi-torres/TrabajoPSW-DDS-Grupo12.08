import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import StepIndicator from "../components/createEvent/StepIndicator";
import StepDetalles from "../components/createEvent/StepDetalles";
import StepVotaciones from "../components/createEvent/StepVotaciones";
import StepReglas from "../components/createEvent/StepReglas";
import { toast } from "sonner";
import { AuthContext } from "../context/AuthContext";

const steps = [
  { number: 1, label: "Detalles" },
  { number: 2, label: "Votaciones" },
  { number: 3, label: "Reglas y Evaluación" },
];

const CreateEvent = () => {
  const { userId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

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
    categorias: []
  });

  const [reglas, setReglas] = useState({
    plantilla: "",
    dimensiones: [],
    analisisAutomatico: false,
  });

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
    
    // Paso 2 (Votaciones)
    
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

    if (!reglas.plantilla) {
      throw new Error("Debes seleccionar una plantilla de baremos.");
    }

    // TIPO EVENTO
    const tipoEvento =
      reglas.plantilla === "hackathon" ? "Hackaton"
      : reglas.plantilla === "pitch" ? "Evento Pequeño"
      : "Feria";

    // NORMALIZAR CATEGORÍAS (CLAVE)
    const categoriasFinales = [
      ...new Set(
        votacion.categorias.length === 0
          ? ["Global"]
          : votacion.categorias
      )
    ];

    // BODY EVENTO
    const body = {
      nombre: detalles.nombre,
      descripcion: detalles.descripcion,
      fechaInicio: inicio.toISOString(),
      fechaFin: fin.toISOString(),
      tipoEvento,
      idOrganizador: userId,
      codEvento: Math.floor(100000 + Math.random() * 900000),

      baremos: reglas.dimensiones.map(d => ({
        nombre: d.nombre,
        criterios: [],
      })),

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

    const eventoId = data.id;

    // 2. CREAR CATEGORÍAS
    for (const nombre of categoriasFinales) {
      const catResponse = await fetch(
        "http://localhost:5245/api/categorias",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            idEvento: eventoId,
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
    toast.error("Error al crear el evento", {
      description: error.message,
    });
  } finally {
    setIsPublishing(false);
  }
};

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        {/* Stepper */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Title */}
        <div className="text-center mt-8 mb-6">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            {currentStep === 1 && "Detalles del Evento"}
            {currentStep === 2 && "Configuración de Votación"}
            {currentStep === 3 && "Reglas y Baremos"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Paso {currentStep} de {steps.length}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-votify-base p-6 sm:p-8">
          {currentStep === 1 && <StepDetalles data={detalles} onChange={setDetalles} />}
          {currentStep === 2 && <StepVotaciones data={votacion} onChange={setVotacion} />}
          {currentStep === 3 && <StepReglas data={reglas} onChange={setReglas} />}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => currentStep === 1 ? navigate("/eventos") : handlePrev()}
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
              className="flex items-center gap-2 h-12 px-6 rounded-md font-heading font-semibold bg-success text-white hover:brightness-105 hover:scale-[1.02] hover:shadow-hover transition-all duration-[150ms]"
            >
              Publicar Evento
              <Check className="w-4 h-4" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;
