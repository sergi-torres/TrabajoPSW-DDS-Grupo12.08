import { useState, useEffect, useCallback } from "react";
import { HelpCircle, X, ChevronDown, Lightbulb } from "lucide-react";

/* ── Help entries for event configuration ── */
interface HelpEntry {
  id: number;
  tag: string;
  tagColor: string;
  title: string;
  body: string;
}

const CONFIG_HELP_ENTRIES: HelpEntry[] = [
  {
    id: 1,
    tag: "Baremos",
    tagColor: "#F59E0B",
    title: "¿Qué son los Baremos?",
    body: "Un baremo es un conjunto de criterios de evaluación predefinido. Votify ofrece plantillas como 'Hackathon estándar' o 'Pitch Competition' con criterios y pesos ya configurados. Puedes seleccionar una plantilla como punto de partida y después personalizar los criterios según las necesidades de tu evento.",
  },
  {
    id: 2,
    tag: "Criterios",
    tagColor: "#8B5CF6",
    title: "¿Qué es la Ponderación de Criterios?",
    body: "La ponderación define cuánto peso (%) tiene cada criterio en la puntuación final. Por ejemplo, si 'Innovación' tiene un 40% y 'Diseño' un 60%, el criterio de Diseño influirá más. La suma de todos los pesos debe ser exactamente 100%.",
  },
  {
    id: 3,
    tag: "Votación",
    tagColor: "#3B82F6",
    title: "¿Cómo funciona Jurado vs. Público?",
    body: "El organizador define qué porcentaje de la nota final proviene del jurado experto y cuánto del público. Con un peso de Jurado al 70%, el 70% de la puntuación vendrá de las evaluaciones del jurado y el 30% restante del público. Si desactivas el voto público, el jurado decide el 100%.",
  },
  {
    id: 4,
    tag: "Categorías",
    tagColor: "#10B981",
    title: "¿Para qué sirven las Categorías?",
    body: "Las categorías agrupan los proyectos que compiten entre sí. Puedes crear categorías como 'Mejor Innovación' o 'Mejor Diseño'. Cada categoría tiene su propio ranking y podio. Si no defines ninguna, se creará automáticamente una categoría 'Global' que agrupa todos los proyectos.",
  },
  {
    id: 5,
    tag: "Límites",
    tagColor: "#F97316",
    title: "¿Qué es el límite de votos?",
    body: "El límite determina cuántos proyectos puede evaluar cada votante dentro de una categoría. Puedes configurarlo de forma global (igual para todas las categorías) o personalizarlo por categoría individual. Solo aplica a categorías en estado 'Pendiente'.",
  },
  {
    id: 6,
    tag: "Comentarios",
    tagColor: "#EF4444",
    title: "¿Comentarios obligatorios u opcionales?",
    body: "Si activas los comentarios obligatorios, cada votante deberá justificar su puntuación con un texto escrito. Puedes activarlo de forma global para todo el evento, o criterio a criterio desde la configuración de baremos. Esto mejora la calidad del feedback recibido por los participantes.",
  },
];

/* ── Component ── */
export default function ConfigHelpPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    },
    []
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleKeyDown]);

  const toggleEntry = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chp-trigger"
        aria-label="Guía de configuración"
        title="Guía de configuración"
      >
        {isOpen ? <X size={22} /> : <HelpCircle size={22} />}
      </button>

      {/* ── Slide-out Panel ── */}
      {isOpen && (
        <>
          <div className="chp-backdrop" onClick={() => setIsOpen(false)} />
          <aside className="chp-panel">
            {/* Header */}
            <div className="chp-panel__header">
              <div className="chp-panel__header-icon">
                <Lightbulb size={20} />
              </div>
              <div>
                <h3 className="chp-panel__title">Guía de Configuración</h3>
                <p className="chp-panel__subtitle">Términos y conceptos clave</p>
              </div>
              <button className="chp-panel__close" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Entries */}
            <div className="chp-panel__list">
              {CONFIG_HELP_ENTRIES.map((entry) => (
                <div key={entry.id} className="chp-entry">
                  <button
                    className={`chp-entry__header ${expandedId === entry.id ? "chp-entry__header--open" : ""}`}
                    onClick={() => toggleEntry(entry.id)}
                  >
                    <div className="chp-entry__left">
                      <span
                        className="chp-entry__tag"
                        style={{ backgroundColor: `${entry.tagColor}15`, color: entry.tagColor, borderColor: `${entry.tagColor}30` }}
                      >
                        {entry.tag}
                      </span>
                      <span className="chp-entry__title">{entry.title}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`chp-entry__chevron ${expandedId === entry.id ? "chp-entry__chevron--open" : ""}`}
                    />
                  </button>

                  {expandedId === entry.id && (
                    <div className="chp-entry__body">
                      <p>{entry.body}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="chp-panel__footer">
              <span>{CONFIG_HELP_ENTRIES.length} conceptos</span>
            </div>
          </aside>
        </>
      )}

      <style>{`
        /* ── Trigger ── */
        .chp-trigger {
          position: fixed;
          bottom: 100px;
          right: 24px;
          z-index: 90;
          width: 52px;
          height: 52px;
          border-radius: 16px;
          border: none;
          background: linear-gradient(135deg, #3B82F6, #2563eb);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.35);
          transition: all 200ms ease;
        }

        .chp-trigger:hover {
          transform: scale(1.08);
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.45);
        }

        /* Subtle pulse animation when closed */
        .chp-trigger:not(:hover) {
          animation: chp-pulse 3s ease-in-out infinite;
        }

        @keyframes chp-pulse {
          0%, 100% { box-shadow: 0 6px 24px rgba(37, 99, 235, 0.35); }
          50% { box-shadow: 0 6px 32px rgba(37, 99, 235, 0.55); }
        }

        @media (max-width: 1024px) {
          .chp-trigger {
            bottom: 90px;
            right: 16px;
            width: 46px;
            height: 46px;
            border-radius: 14px;
          }
        }

        /* ── Backdrop (mobile) ── */
        .chp-backdrop {
          position: fixed;
          inset: 0;
          z-index: 95;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(2px);
          animation: chp-fade-in 150ms ease;
        }

        @media (min-width: 1024px) {
          .chp-backdrop {
            display: none;
          }
        }

        @keyframes chp-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── Panel ── */
        .chp-panel {
          position: fixed;
          top: 16px;
          right: 16px;
          bottom: 16px;
          z-index: 100;
          width: 360px;
          max-width: calc(100vw - 32px);
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: chp-slide-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes chp-slide-in {
          from {
            opacity: 0;
            transform: translateX(40px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        /* Header */
        .chp-panel__header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 20px;
          background: linear-gradient(135deg, #EFF6FF, #f0f4ff);
          border-bottom: 1px solid #e0e7ff;
        }

        .chp-panel__header-icon {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: linear-gradient(135deg, #3B82F6, #2563eb);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .chp-panel__title {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: #1e293b;
          margin: 0;
        }

        .chp-panel__subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          color: #64748b;
          margin: 2px 0 0;
        }

        .chp-panel__close {
          margin-left: auto;
          width: 32px;
          height: 32px;
          border-radius: 10px;
          border: none;
          background: rgba(0, 0, 0, 0.06);
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 150ms ease;
        }

        .chp-panel__close:hover {
          background: rgba(0, 0, 0, 0.1);
          color: #1e293b;
        }

        /* List */
        .chp-panel__list {
          flex: 1;
          overflow-y: auto;
          padding: 12px 16px;
        }

        .chp-panel__list::-webkit-scrollbar {
          width: 3px;
        }

        .chp-panel__list::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }

        /* Entries */
        .chp-entry {
          border-bottom: 1px solid #f1f5f9;
        }

        .chp-entry:last-child {
          border-bottom: none;
        }

        .chp-entry__header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 150ms ease;
          border-radius: 10px;
          gap: 8px;
        }

        .chp-entry__header:hover {
          background: #f8fafc;
        }

        .chp-entry__left {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .chp-entry__tag {
          display: inline-block;
          width: fit-content;
          font-family: 'Poppins', sans-serif;
          font-size: 0.55rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid;
        }

        .chp-entry__title {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1e293b;
        }

        .chp-entry__chevron {
          color: #94a3b8;
          transition: transform 250ms ease;
          flex-shrink: 0;
        }

        .chp-entry__chevron--open {
          transform: rotate(180deg);
          color: #3B82F6;
        }

        .chp-entry__body {
          padding: 0 6px 14px 6px;
          animation: chp-answer-in 200ms ease;
        }

        @keyframes chp-answer-in {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .chp-entry__body p {
          font-family: 'Inter', sans-serif;
          font-size: 0.78rem;
          line-height: 1.65;
          color: #475569;
          margin: 0;
          padding: 10px 12px;
          background: #f8fafc;
          border-radius: 10px;
          border-left: 3px solid #3B82F6;
        }

        /* Footer */
        .chp-panel__footer {
          padding: 12px 20px;
          border-top: 1px solid #f1f5f9;
          background: #fafbfc;
        }

        .chp-panel__footer span {
          font-family: 'Inter', sans-serif;
          font-size: 0.68rem;
          color: #94a3b8;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .chp-trigger { animation: none; }
          .chp-panel { animation: none; }
          .chp-entry__body { animation: none; }
          .chp-backdrop { animation: none; }
        }
      `}</style>
    </>
  );
}
