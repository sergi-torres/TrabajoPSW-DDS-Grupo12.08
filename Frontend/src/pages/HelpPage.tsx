import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  HelpCircle, 
  Target, 
  Users, 
  Award, 
  Scale, 
  MessageSquare, 
  Sparkles,
  ShieldCheck,
  Search
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { useContext } from "react";
import { EventContext } from "../context/EventContext";

/**
 * HelpPage — Guía de usuario oficial de Votify.
 * Centraliza la documentación y ayuda para todos los roles.
 */
export default function HelpPage() {
  const navigate = useNavigate();
  const { userColor } = useContext(EventContext)!;
  const themeColor = userColor || "#2563eb";

  const sections = [
    {
      id: "conceptos",
      title: "Conceptos Básicos",
      icon: HelpCircle,
      content: "Votify es una plataforma para la gestión y evaluación de eventos competitivos (Hackathons, Ferias, Pitches). Centraliza el registro, la votación en tiempo real y el feedback avanzado."
    },
    {
      id: "roles",
      title: "Roles del Sistema",
      icon: Users,
      items: [
        { label: "Organizador", desc: "Crea eventos, configura baremos y monitorea resultados en vivo." },
        { label: "Jurado", desc: "Evalúa proyectos asignados bajo criterios específicos y deja comentarios." },
        { label: "Participante", desc: "Registra su proyecto y recibe síntesis de feedback generadas por IA." }
      ]
    },
    {
      id: "votacion",
      title: "Sistema de Votación",
      icon: Scale,
      content: "Los resultados se calculan ponderando el voto del Jurado y del Público. El Organizador decide el peso de cada grupo (ej. 70% Jurado / 30% Público)."
    },
    {
      id: "ia",
      title: "Síntesis con IA",
      icon: Sparkles,
      content: "Utilizamos inteligencia artificial para analizar cientos de comentarios y extraer automáticamente fortalezas y áreas de mejora para cada proyecto."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <header
        className="text-white p-6 lg:p-10 transition-all duration-300"
        style={{ backgroundColor: themeColor }}
      >
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
            Volver
          </button>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
              <HelpCircle size={32} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-1">
                Guía de Usuario
              </h1>
              <p className="opacity-90 text-lg font-medium">
                Todo lo que necesitas saber sobre Votify
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6 lg:p-10 -mt-6">
        <div className="grid grid-cols-1 gap-6">
          {sections.map((section) => (
            <section 
              key={section.id} 
              className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-900">
                  <section.icon size={22} strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-heading font-bold text-slate-900">{section.title}</h2>
              </div>

              {section.content && (
                <p className="text-slate-600 leading-relaxed">
                  {section.content}
                </p>
              )}

              {section.items && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {section.items.map((item) => (
                    <div key={item.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h3 className="font-bold text-slate-900 mb-1">{item.label}</h3>
                      <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* Tips Adicionales */}
          <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row items-center gap-6">
             <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                <ShieldCheck size={40} />
             </div>
             <div>
                <h3 className="text-xl font-heading font-bold mb-2">Seguridad y Transparencia</h3>
                <p className="text-blue-50 text-sm leading-relaxed">
                  Utilizamos huella digital del navegador para evitar votos duplicados y asegurar que cada participante tenga una experiencia justa y transparente.
                </p>
             </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>© 2026 Votify Platform · Heurística: Ayuda y Documentación</p>
        </footer>
      </main>
    </div>
  );
}
