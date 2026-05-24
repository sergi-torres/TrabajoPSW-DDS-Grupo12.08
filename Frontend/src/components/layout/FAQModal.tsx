import { useState, useMemo, useEffect, useCallback } from "react";
import { HelpCircle, Search, ChevronDown, X } from "lucide-react";

/* ── FAQ Data ── */
interface FAQItem {
  id: number;
  category: string;
  categoryColor: string;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    category: "Proyectos",
    categoryColor: "#8B5CF6",
    question: "¿Cómo creo un nuevo proyecto?",
    answer:
      "Utiliza el botón 'Registrar Proyecto' en la barra lateral izquierda. Se abrirá un formulario donde deberás completar los datos básicos del proyecto: nombre, descripción y categoría a la que deseas inscribirlo. Una vez completado, haz clic en 'Guardar' para registrar la unidad de trabajo.",
  },
  {
    id: 2,
    category: "Criterios",
    categoryColor: "#F59E0B",
    question: "¿Qué significa 'Ponderación de Criterios'?",
    answer:
      "La ponderación de criterios define cuánto peso tiene cada criterio de evaluación en la puntuación final de un proyecto. Por ejemplo, si 'Innovación' tiene un peso del 40% y 'Diseño' un 60%, el criterio de Diseño influirá más en la nota final. La suma de todos los pesos debe ser exactamente 100%.",
  },
  {
    id: 3,
    category: "Criterios",
    categoryColor: "#F59E0B",
    question: "¿Qué son los 'Baremos' y cómo se configuran?",
    answer:
      "Un baremo es un conjunto de criterios de evaluación predefinido. Votify ofrece plantillas como 'Hackathon estándar' o 'Pitch Competition' con criterios y pesos ya configurados. Puedes seleccionar una plantilla como punto de partida y luego personalizar los criterios, renombrarlos o ajustar sus pesos según las necesidades de tu evento.",
  },
  {
    id: 4,
    category: "Votación",
    categoryColor: "#3B82F6",
    question: "¿Cómo funciona el peso Jurado vs. Público?",
    answer:
      "El organizador puede definir qué porcentaje de la nota final proviene del voto del jurado experto y cuánto del público general. Por ejemplo, con un peso de Jurado al 70%, el 70% de la puntuación final de cada proyecto vendrá de las evaluaciones del jurado y el 30% restante del público. Si desactivas el voto público, el jurado decide el 100%.",
  },
  {
    id: 5,
    category: "Informes",
    categoryColor: "#10B981",
    question: "¿Cómo exporto un informe de evaluación?",
    answer:
      "Desde el dashboard del organizador puedes visualizar los rankings de cada categoría en tiempo real. Los resultados se actualizan automáticamente conforme se emiten votos. Para exportar datos, puedes utilizar las funciones de captura de pantalla del navegador o generar certificados de los ganadores desde la sección de premios.",
  },
  {
    id: 6,
    category: "Gestión",
    categoryColor: "#EF4444",
    question: "¿Cómo asigno roles a los usuarios del sistema?",
    answer:
      "Los roles se asignan automáticamente según el método de acceso: los organizadores crean eventos, los jurados son invitados por email desde la sección 'Jurado', los participantes se registran con el código del evento, y el público accede con el mismo código pero sin registrar proyecto. Cada rol tiene permisos y vistas diferentes.",
  },
  {
    id: 7,
    category: "Configuración",
    categoryColor: "#717182",
    question: "¿Puedo cambiar el idioma de la interfaz?",
    answer:
      "Actualmente Votify está disponible en español. La interfaz utiliza nomenclatura en español para el dominio (categorías, baremos, criterios) y nomenclatura técnica en inglés para elementos del código. Si necesitas soporte multiidioma, contacta con el equipo de desarrollo.",
  },
  {
    id: 8,
    category: "Premios",
    categoryColor: "#F97316",
    question: "¿Cómo asigno premios a las categorías?",
    answer:
      "Accede a la sección 'Premios' desde el menú lateral. Allí verás las categorías de tu evento con tres posiciones (1ª, 2ª, 3ª). Haz clic en '+ Asignar Premio' para crear un premio con nombre, descripción e icono. Los premios asignados se mostrarán automáticamente en el ranking del podio cuando la categoría se finalice.",
  },
];

/* ── Component ── */
interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQModal({ isOpen, onClose }: FAQModalProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(1); // First one open by default

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  // Filter FAQ items based on search
  const filteredItems = useMemo(() => {
    if (!search.trim()) return FAQ_DATA;
    const q = search.toLowerCase();
    return FAQ_DATA.filter(
      (item) =>
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [search]);

  const toggleItem = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  return (
    <div className="faq-overlay" onClick={onClose}>
      <div className="faq-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="faq-header">
          <div className="faq-header__left">
            <div className="faq-header__icon">
              <HelpCircle size={24} strokeWidth={2} />
            </div>
            <div>
              <h2 className="faq-header__title">Preguntas Frecuentes</h2>
              <p className="faq-header__subtitle">Guía de Inicio · Votify</p>
            </div>
          </div>
          <button className="faq-close-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="faq-search">
          <Search size={16} className="faq-search__icon" />
          <input
            type="text"
            placeholder="Buscar en preguntas frecuentes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="faq-search__input"
            autoFocus
          />
        </div>

        {/* Questions */}
        <div className="faq-list">
          {filteredItems.map((item) => (
            <div key={item.id} className="faq-item">
              <button
                className={`faq-item__header ${expandedId === item.id ? "faq-item__header--open" : ""}`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="faq-item__left">
                  <span
                    className="faq-item__dot"
                    style={{ backgroundColor: item.categoryColor }}
                  />
                  <div>
                    <span
                      className="faq-item__category"
                      style={{ color: item.categoryColor }}
                    >
                      {item.category}
                    </span>
                    <span className="faq-item__question">{item.question}</span>
                  </div>
                </div>
                <ChevronDown
                  size={18}
                  className={`faq-item__chevron ${expandedId === item.id ? "faq-item__chevron--open" : ""}`}
                />
              </button>

              {expandedId === item.id && (
                <div className="faq-item__answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="faq-empty">
              <p>No se encontraron resultados para "{search}"</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="faq-footer">
          <span className="faq-footer__count">
            {filteredItems.length} preguntas — Votify v2.x
          </span>
          <button className="faq-footer__close" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      <style>{`
        .faq-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(4px);
          padding: 16px;
          animation: faq-overlay-in 200ms ease;
        }

        @keyframes faq-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .faq-modal {
          width: 100%;
          max-width: 580px;
          max-height: 85vh;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 24px 48px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: faq-modal-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes faq-modal-in {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Header */
        .faq-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: #ffffff;
        }

        .faq-header__left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .faq-header__icon {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .faq-header__title {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          margin: 0;
        }

        .faq-header__subtitle {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          opacity: 0.75;
          margin: 2px 0 0;
        }

        .faq-close-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          background: rgba(255, 255, 255, 0.15);
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease;
        }

        .faq-close-btn:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Search */
        .faq-search {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 16px 20px 8px;
          padding: 10px 16px;
          border-radius: 14px;
          background: #f3f4f6;
          border: 2px solid transparent;
          transition: border-color 150ms ease;
        }

        .faq-search:focus-within {
          border-color: var(--info, #3B82F6);
          background: #ffffff;
        }

        .faq-search__icon {
          color: #9ca3af;
          flex-shrink: 0;
        }

        .faq-search__input {
          flex: 1;
          border: none;
          background: transparent;
          outline: none;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #1f2937;
        }

        .faq-search__input::placeholder {
          color: #9ca3af;
        }

        /* List */
        .faq-list {
          flex: 1;
          overflow-y: auto;
          padding: 8px 20px;
        }

        .faq-item {
          border-bottom: 1px solid #f3f4f6;
        }

        .faq-item:last-child {
          border-bottom: none;
        }

        .faq-item__header {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          text-align: left;
          transition: background 150ms ease;
          border-radius: 12px;
        }

        .faq-item__header:hover {
          background: #f9fafb;
        }

        .faq-item__left {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex: 1;
          min-width: 0;
        }

        .faq-item__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          flex-shrink: 0;
        }

        .faq-item__category {
          display: block;
          font-family: 'Poppins', sans-serif;
          font-size: 0.6rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 2px;
        }

        .faq-item__question {
          display: block;
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          font-weight: 600;
          color: #1f2937;
        }

        .faq-item__chevron {
          color: #9ca3af;
          transition: transform 250ms ease;
          flex-shrink: 0;
        }

        .faq-item__chevron--open {
          transform: rotate(180deg);
          color: var(--info, #3B82F6);
        }

        .faq-item__answer {
          padding: 0 4px 16px 24px;
          animation: faq-answer-in 250ms ease;
        }

        @keyframes faq-answer-in {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .faq-item__answer p {
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          line-height: 1.65;
          color: #4b5563;
          margin: 0;
        }

        .faq-empty {
          text-align: center;
          padding: 32px 16px;
        }

        .faq-empty p {
          font-family: 'Inter', sans-serif;
          font-size: 0.875rem;
          color: #9ca3af;
          font-style: italic;
        }

        /* Footer */
        .faq-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 24px;
          border-top: 1px solid #f3f4f6;
          background: #fafafa;
        }

        .faq-footer__count {
          font-family: 'Inter', sans-serif;
          font-size: 0.7rem;
          color: #9ca3af;
        }

        .faq-footer__close {
          padding: 8px 20px;
          border-radius: 12px;
          border: none;
          background: var(--info, #3B82F6);
          color: #ffffff;
          font-family: 'Poppins', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .faq-footer__close:hover {
          opacity: 0.9;
          transform: scale(1.02);
        }

        /* Scrollbar */
        .faq-list::-webkit-scrollbar {
          width: 4px;
        }

        .faq-list::-webkit-scrollbar-track {
          background: transparent;
        }

        .faq-list::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
