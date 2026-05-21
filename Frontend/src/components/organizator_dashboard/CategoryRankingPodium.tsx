// src/components/organizator_dashboard/CategoryRankingPodium.tsx
import { useState, useEffect } from "react";
import { Trophy, Clock, Award, DollarSign, Medal, Sparkles, Gift } from "lucide-react";
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
export default function CategoryRankingPodium({ categorias, premios = [] }: CategoryRankingPodiumProps) {
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [animateKey, setAnimateKey] = useState(0);

  // Set first tab on mount or when categories change
  useEffect(() => {
    if (categorias.length > 0 && activeTabId === null) {
      setActiveTabId(categorias[0].id);
    }
  }, [categorias, activeTabId]);

  const activeCategory = categorias.find((c) => c.id === activeTabId) ?? null;

  const handleTabChange = (id: number) => {
    setActiveTabId(id);
    // Trigger re-animation on tab change
    setAnimateKey((k) => k + 1);
  };

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
      {/* ── Category Tabs ── */}
      <div className="crp-tabs" role="tablist" aria-label="Categorías del ranking">
        {categorias.map((cat) => (
          <button
            key={cat.id}
            role="tab"
            aria-selected={cat.id === activeTabId}
            className={`crp-tab ${cat.id === activeTabId ? "crp-tab--active" : ""}`}
            onClick={() => handleTabChange(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="crp-content" key={animateKey}>
        {activeCategory && !activeCategory.finalizada && (
          <VotacionEnCurso />
        )}
        {activeCategory && activeCategory.finalizada && activeCategory.ganadores && (
          <Podium
            ganadores={activeCategory.ganadores}
            premios={premios.filter(p => p.idCategoria === activeCategory.id)}
          />
        )}
        {activeCategory && activeCategory.finalizada && !activeCategory.ganadores?.length && (
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
  // Normalize icon key: lowercase, try partial match for flexibility
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

/* ── Podium with 3 winners ── */
function Podium({ ganadores, premios = [] }: { ganadores: PodiumProject[]; premios?: Premio[] }) {
  // Ensure we have at most 3
  const top3 = ganadores.slice(0, 3);
  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  // Get premio for a given position
  const getPremio = (posicion: number) => premios.find(p => p.posicion === posicion) ?? null;

  const premio1 = getPremio(1);
  const premio2 = getPremio(2);
  const premio3 = getPremio(3);

  // Podium display order: 2nd — 1st — 3rd
  return (
    <div className="crp-podium-wrapper">
      <div className="crp-podium">
        {/* 2nd place */}
        {second ? (
          <div className="crp-podium__slot crp-podium__slot--second crp-podium__slot--animate" style={{ animationDelay: "0.2s" }}>
            <div className="crp-podium__badge crp-podium__badge--silver">2</div>
            <div className="crp-podium__card crp-podium__card--silver">
              <h5 className="crp-podium__name">{second.name}</h5>
              <p className="crp-podium__team">{second.team}</p>
              <div className="crp-podium__score-box crp-podium__score-box--silver">
                <span className="crp-podium__score">{second.score}</span>
                <span className="crp-podium__score-label">puntos</span>
              </div>
            </div>
            {premio2 && <PremioTag premio={premio2} />}
          </div>
        ) : <div className="crp-podium__slot crp-podium__slot--empty" />}

        {/* 1st place (winner) */}
        {first && (
          <div className="crp-podium__slot crp-podium__slot--first crp-podium__slot--animate" style={{ animationDelay: "0s" }}>
            <div className="crp-podium__badge crp-podium__badge--gold">1</div>
            <div className="crp-podium__card crp-podium__card--gold">
              <div className="crp-podium__winner-tag">
                <Trophy size={14} strokeWidth={2.5} />
                GANADOR
              </div>
              <h5 className="crp-podium__name crp-podium__name--winner">{first.name}</h5>
              <p className="crp-podium__team">{first.team}</p>
              <div className="crp-podium__score-box crp-podium__score-box--gold">
                <span className="crp-podium__score crp-podium__score--gold">{first.score}</span>
                <span className="crp-podium__score-label">puntos</span>
              </div>
            </div>
            {premio1 && <PremioTag premio={premio1} />}
          </div>
        )}

        {/* 3rd place */}
        {third ? (
          <div className="crp-podium__slot crp-podium__slot--third crp-podium__slot--animate" style={{ animationDelay: "0.4s" }}>
            <div className="crp-podium__badge crp-podium__badge--bronze">3</div>
            <div className="crp-podium__card crp-podium__card--bronze">
              <h5 className="crp-podium__name">{third.name}</h5>
              <p className="crp-podium__team">{third.team}</p>
              <div className="crp-podium__score-box crp-podium__score-box--bronze">
                <span className="crp-podium__score">{third.score}</span>
                <span className="crp-podium__score-label">puntos</span>
              </div>
            </div>
            {premio3 && <PremioTag premio={premio3} />}
          </div>
        ) : <div className="crp-podium__slot crp-podium__slot--empty" />}
      </div>
    </div>
  );
}
