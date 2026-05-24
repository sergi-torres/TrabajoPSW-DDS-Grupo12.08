// src/components/organizator_dashboard/CategoryRankingPodium.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import { Trophy, Clock, Award, DollarSign, Medal, Sparkles, Gift, Eye, ChevronRight } from "lucide-react";
import confetti from "canvas-confetti";
import type { Premio } from "../../types";
import "./CategoryRankingPodium.css";

/* ── Types ── */
export interface PodiumProject {
  id: number | string;
  name: string;
  team: string;
  score: number;
}

export interface CategoryRankingData {
  id: number;
  nombre: string;
  /** true = votación cerrada, hay ganadores */
  finalizada: boolean;
  /** Top 3 proyectos (solo cuando finalizada = true) */
  ganadores?: PodiumProject[];
}

interface CategoryRankingPodiumProps {
  categorias: CategoryRankingData[];
  premios?: Premio[];
  /** Only the organizer gets the manual reveal button */
  isOrganizer?: boolean;
}

/* ── Icon map (same as CategoriasPremioCard) ── */
const premioIconMap: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  trofeo: Trophy,
  medalla: Medal,
  dinero: DollarSign,
  award: Award,
  brillo: Sparkles,
};

/* ── Component ── */
export default function CategoryRankingPodium({ categorias, premios = [], isOrganizer = false }: CategoryRankingPodiumProps) {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [animateKey, setAnimateKey] = useState(0);

  // Reveal state: tracks how many positions have been revealed per category
  // revealedCategories[catId] = 0 (none) | 1 (3rd) | 2 (3rd+2nd) | 3 (all)
  const [revealedCategories, setRevealedCategories] = useState<Record<number, number>>({});

  // Set first tab on mount or when categories change
  useEffect(() => {
    if (categorias.length > 0 && activeTabId === null) {
      setActiveTabId(categorias[0].id);
    }
  }, [categorias, activeTabId]);

  const activeCategory = categorias.find((c) => c.id === activeTabId) ?? null;

  const handleTabChange = (id: number) => {
    setActiveTabId(id);
    setAnimateKey((k) => k + 1);
  };

  const getRevealStep = (catId: number) => revealedCategories[catId] ?? 0;

  const advanceReveal = useCallback((catId: number) => {
    setRevealedCategories((prev) => {
      const current = prev[catId] ?? 0;
      if (current >= 3) return prev;
      return { ...prev, [catId]: current + 1 };
    });
  }, []);

  if (categorias.length === 0) {
    return (
      <div className="crp-empty">
        <Trophy size={32} strokeWidth={1.5} className="crp-empty__icon" />
        <p className="crp-empty__text">No hay categorías definidas</p>
      </div>
    );
  }

  return (
    <div className="crp">
      {/* ── Category selector ── */}
      <select
        className="w-full mb-4 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={activeTabId ?? ""}
        onChange={(e) => handleTabChange(Number(e.target.value))}
        aria-label="Seleccionar categoría"
      >
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nombre}</option>
        ))}
      </select>

      {/* ── Content ── */}
      <div className="crp-content" key={animateKey}>
        {activeCategory && !activeCategory.finalizada && (
          <VotacionEnCurso />
        )}
        {activeCategory && activeCategory.finalizada && activeCategory.ganadores && activeCategory.ganadores.length > 0 && (
          <Podium
            ganadores={activeCategory.ganadores}
            premios={premios.filter(p => p.idCategoria === activeCategory.id)}
            categoryName={activeCategory.nombre}
            revealStep={getRevealStep(activeCategory.id)}
            onReveal={() => advanceReveal(activeCategory.id)}
            isOrganizer={isOrganizer}
          />
        )}
        {activeCategory && activeCategory.finalizada && (!activeCategory.ganadores || activeCategory.ganadores.length === 0) && (
          <VotacionEnCurso message="Sin resultados disponibles" />
        )}
      </div>
    </div>
  );
}

/* ── Votación en curso (empty state) ── */
function VotacionEnCurso({ message }: { message?: string }) {
  return (
    <div className="crp-voting-active">
      <div className="crp-voting-active__pulse-ring">
        <div className="crp-voting-active__icon-wrap">
          <Clock size={40} strokeWidth={1.5} />
        </div>
      </div>
      <h4 className="crp-voting-active__title">
        {message || "Votación aún en curso"}
      </h4>
      <p className="crp-voting-active__subtitle">
        Los ganadores se anunciarán próximamente
      </p>
    </div>
  );
}

/* ── Prize badge (shown below each podium card) ── */
function PremioTag({ premio }: { premio: Premio }) {
  const rawIcon = (premio.icono || '').toLowerCase().trim();
  const matchedKey = Object.keys(premioIconMap).find(k => rawIcon.includes(k)) || '';
  const Icon = premioIconMap[matchedKey] || Gift;
  return (
    <div className="crp-premio">
      <div className="crp-premio__icon">
        <Icon size={14} />
      </div>
      <div className="crp-premio__info">
        <span className="crp-premio__name">{premio.nombre}</span>
        {premio.descripcion && (
          <span className="crp-premio__desc">{premio.descripcion}</span>
        )}
      </div>
    </div>
  );
}

/* ── Flippable Card ── */
interface FlipCardProps {
  project: PodiumProject;
  position: 1 | 2 | 3;
  premio: Premio | null;
  categoryName: string;
  variant: 'gold' | 'silver' | 'bronze';
}

function FlipCard({ project, position, premio, categoryName, variant }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const positionLabels: Record<number, string> = {
    1: '1er Puesto',
    2: '2do Puesto',
    3: '3er Puesto',
  };

  const rawIcon = (premio?.icono || '').toLowerCase().trim();
  const matchedKey = Object.keys(premioIconMap).find(k => rawIcon.includes(k)) || '';
  const PremioIcon = premioIconMap[matchedKey] || Gift;

  return (
    <div
      className={`crp-flip-container crp-flip-container--${variant}`}
      onClick={() => setIsFlipped(!isFlipped)}
      title="Clic para ver más detalles"
    >
      <div className={`crp-flip-inner ${isFlipped ? 'crp-flip-inner--flipped' : ''}`}>
        {/* ── FRONT ── */}
        <div className={`crp-flip-front crp-podium__card crp-podium__card--${variant}`}>
          {position === 1 && (
            <div className="crp-podium__winner-tag">
              <Trophy size={14} strokeWidth={2.5} />
              GANADOR
            </div>
          )}
          <h5 className={`crp-podium__name ${position === 1 ? 'crp-podium__name--winner' : ''}`}>
            {project.name}
          </h5>
          <p className="crp-podium__team">{project.team}</p>
          <div className={`crp-podium__score-box crp-podium__score-box--${variant}`}>
            <span className={`crp-podium__score ${variant === 'gold' ? 'crp-podium__score--gold' : ''}`}>
              {project.score}
            </span>
            <span className="crp-podium__score-label">puntos</span>
          </div>
          <div className="crp-flip-hint">
            <Eye size={12} />
            <span>Detalles</span>
          </div>
        </div>

        {/* ── BACK ── */}
        <div className={`crp-flip-back crp-flip-back--${variant}`}>
          <div className="crp-flip-back__position">{positionLabels[position]}</div>
          <div className="crp-flip-back__category">{categoryName}</div>

          <div className="crp-flip-back__project-name">{project.name}</div>
          <div className="crp-flip-back__team">{project.team}</div>

          <div className="crp-flip-back__score-ring">
            <span className="crp-flip-back__score-value">{project.score}</span>
            <span className="crp-flip-back__score-unit">pts</span>
          </div>

          {premio ? (
            <div className="crp-flip-back__premio">
              <div className="crp-flip-back__premio-icon">
                <PremioIcon size={18} />
              </div>
              <div className="crp-flip-back__premio-info">
                <span className="crp-flip-back__premio-label">Premio</span>
                <span className="crp-flip-back__premio-name">{premio.nombre}</span>
                {premio.descripcion && (
                  <span className="crp-flip-back__premio-desc">{premio.descripcion}</span>
                )}
              </div>
            </div>
          ) : (
            <div className="crp-flip-back__no-premio">Sin premio asignado</div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reveal Button ── */
function RevealButton({ step, onReveal }: { step: number; onReveal: () => void }) {
  const labels = [
    { text: '🏆 Revelar Ganadores', sub: 'Descubre los resultados' },
    { text: 'Siguiente...', sub: 'Revelar 2do puesto' },
    { text: '🥇 ¡Revelar Ganador!', sub: 'El momento esperado' },
  ];

  if (step >= 3) return null;

  const current = labels[step];
  const isLast = step === 2;

  return (
    <div className="crp-reveal-wrapper">
      <button
        className={`crp-reveal-btn ${isLast ? 'crp-reveal-btn--final' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onReveal();
        }}
      >
        <span className="crp-reveal-btn__text">{current.text}</span>
        <span className="crp-reveal-btn__sub">{current.sub}</span>
        <ChevronRight size={20} className="crp-reveal-btn__arrow" />
      </button>
    </div>
  );
}

/* ── Podium with 3 winners ── */
interface PodiumProps {
  ganadores: PodiumProject[];
  premios?: Premio[];
  categoryName: string;
  revealStep: number;
  onReveal: () => void;
  isOrganizer: boolean;
}

function Podium({ ganadores, premios = [], categoryName, revealStep, onReveal, isOrganizer }: PodiumProps) {
  const podiumRef = useRef<HTMLDivElement>(null);
  const top3 = ganadores.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  const getPremio = (posicion: number) => premios.find(p => p.posicion === posicion) ?? null;

  const premio1 = getPremio(1);
  const premio2 = getPremio(2);
  const premio3 = getPremio(3);

  // If not organizer, auto-reveal all immediately
  const effectiveStep = isOrganizer ? revealStep : 3;

  // Confetti effect when 1st place is revealed
  useEffect(() => {
    if (effectiveStep === 3 && isOrganizer && podiumRef.current) {
      // Slight delay so the card animation plays first
      const timer = setTimeout(() => {
        const rect = podiumRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 3) / window.innerHeight;

        // Gold confetti burst
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x, y },
          colors: ['#F59E0B', '#D97706', '#FCD34D', '#ffffff', '#2563eb'],
          startVelocity: 30,
          gravity: 0.8,
          ticks: 120,
          scalar: 1.1,
        });

        // Second burst with slight delay
        setTimeout(() => {
          confetti({
            particleCount: 40,
            spread: 90,
            origin: { x, y: y - 0.05 },
            colors: ['#F59E0B', '#FCD34D', '#FEF3C7'],
            startVelocity: 20,
            gravity: 0.6,
            ticks: 100,
            scalar: 0.8,
          });
        }, 200);
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [effectiveStep, isOrganizer]);

  // Show reveal button only if organizer and not fully revealed
  const showRevealButton = isOrganizer && effectiveStep < 3;

  // Visibility per position based on reveal step
  // Reveal order: step 1 → 3rd, step 2 → 2nd, step 3 → 1st
  const show3rd = effectiveStep >= 1;
  const show2nd = effectiveStep >= 2;
  const show1st = effectiveStep >= 3;

  return (
    <div className="crp-podium-wrapper" ref={podiumRef}>
      {showRevealButton && (
        <RevealButton step={effectiveStep} onReveal={onReveal} />
      )}

      <div className={`crp-podium ${showRevealButton && effectiveStep === 0 ? 'crp-podium--hidden' : ''}`}>
        {/* 2nd place */}
        {second && show2nd ? (
          <div className="crp-podium__slot crp-podium__slot--second crp-podium__slot--reveal" style={{ animationDelay: "0.1s" }}>
            <div className="crp-podium__badge crp-podium__badge--silver">2</div>
            <FlipCard
              project={second}
              position={2}
              premio={premio2}
              categoryName={categoryName}
              variant="silver"
            />
            {premio2 && <PremioTag premio={premio2} />}
          </div>
        ) : <div className="crp-podium__slot crp-podium__slot--empty" />}

        {/* 1st place (winner) */}
        {first && show1st ? (
          <div className="crp-podium__slot crp-podium__slot--first crp-podium__slot--reveal" style={{ animationDelay: "0s" }}>
            <div className="crp-podium__badge crp-podium__badge--gold">1</div>
            <FlipCard
              project={first}
              position={1}
              premio={premio1}
              categoryName={categoryName}
              variant="gold"
            />
            {premio1 && <PremioTag premio={premio1} />}
          </div>
        ) : (show1st ? null : <div className="crp-podium__slot crp-podium__slot--empty" />)}

        {/* 3rd place */}
        {third && show3rd ? (
          <div className="crp-podium__slot crp-podium__slot--third crp-podium__slot--reveal" style={{ animationDelay: "0.2s" }}>
            <div className="crp-podium__badge crp-podium__badge--bronze">3</div>
            <FlipCard
              project={third}
              position={3}
              premio={premio3}
              categoryName={categoryName}
              variant="bronze"
            />
            {premio3 && <PremioTag premio={premio3} />}
          </div>
        ) : <div className="crp-podium__slot crp-podium__slot--empty" />}
      </div>
    </div>
  );
}
