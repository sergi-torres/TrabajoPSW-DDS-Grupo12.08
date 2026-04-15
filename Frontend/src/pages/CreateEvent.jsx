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
    
    if (currentStep < 3) setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handlePublish = async () => {
    if (!detalles.nombre.trim()) {
      toast.error("Campo obligatorio", { description: "El nombre del evento es obligatorio." });
      return;
    }
    if (!detalles.fechaInicio) {
      toast.error("Campo obligatorio", { description: "La fecha de inicio es obligatoria." });
      return;
    }
    if (!detalles.fechaFin) {
      toast.error("Campo obligatorio", { description: "La fecha de fin es obligatoria." });
      return;
    }
    
    const inicio = new Date(detalles.fechaInicio);
    const fin = new Date(detalles.fechaFin);
    if (inicio >= fin) {
      toast.error("Fechas inválidas", { description: "La fecha de inicio debe ser anterior a la fecha de fin." });
      return;
    }

    if (!reglas.plantilla) {
      toast.error("Campo obligatorio", { description: "Debes seleccionar una plantilla de baremos." });
      return;
    }

    try {
      const tipoEvento = reglas.plantilla === "hackathon" ? "Hackaton"
        : reglas.plantilla === "pitch" ? "Evento Pequeño"
          : "Feria";

      const body = {
        nombre: detalles.nombre,
        descripcion: detalles.descripcion,
        fechaInicio: new Date(detalles.fechaInicio).toISOString(),
        fechaFin: new Date(detalles.fechaFin).toISOString(),
        tipoEvento,
        idOrganizador: userId,
        codEvento: Math.floor(100000 + Math.random() * 900000),
        baremos: reglas.dimensiones.map((d) => ({
          nombre: d.nombre,
          criterios: [],
        })),
        categorias: [],
      };

      const response = await fetch("http://localhost:5245/api/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = errorData.error;
        
        if (!errorMessage && errorData.errors) {
            const firstKey = Object.keys(errorData.errors)[0];
            errorMessage = errorData.errors[firstKey][0];
        }
        
        throw new Error(errorMessage || "Error al crear el evento");
      }

      const data = await response.json();
      toast.success("Evento creado exitosamente", {
        description: `Tu evento "${data.nombre}" ha sido publicado con ID ${data.id}.`,
      });
      
      navigate("/eventos");
    } catch (error) {
      toast.error("Error al crear el evento", {
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
        <StepIndicator steps={steps} currentStep={currentStep} />

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

        <div className="bg-card rounded-2xl shadow-votify-base p-6 sm:p-8">
          {currentStep === 1 && <StepDetalles data={detalles} onChange={setDetalles} />}
          {currentStep === 2 && <StepVotaciones data={votacion} onChange={setVotacion} />}
          {currentStep === 3 && <StepReglas data={reglas} onChange={setReglas} />}
        </div>

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
