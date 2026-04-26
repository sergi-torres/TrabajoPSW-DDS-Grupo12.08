// src/components/dashboard/RankingList.tsx
import { Trophy, TrendingUp, TrendingDown, Minus } from "lucide-react";

const MEDAL_COLORS = ["#F59E0B", "#9CA3AF", "#CD7F32"];

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "up") return <TrendingUp size={14} strokeWidth={2} className="trend trend--up" />;
  if (trend === "down") return <TrendingDown size={14} strokeWidth={2} className="trend trend--down" />;
  return <Minus size={14} strokeWidth={2} className="trend trend--stable" />;
}

interface ProjectRanking {
    id: number | string;
    position: number;
    name: string;
    trend: string;
    score: number;
    juryScore: number;
    publicScore: number;
}

interface RankingListProps {
    projects: ProjectRanking[];
}

export default function RankingList({ projects }: RankingListProps) {
  return (
    <section className="dashboard-card ranking-card">
      <div className="dashboard-card__header">
        <Trophy size={20} strokeWidth={1.75} style={{ color: "#F59E0B" }} />
        <h2 className="dashboard-card__title">Ranking en Tiempo Real</h2>
      </div>

      <ol className="ranking-list" aria-label="Ranking de proyectos">
        {projects.map((p, idx) => {
          const medalColor = MEDAL_COLORS[idx] ?? "var(--muted-foreground)";
          const juryWidth = `${p.juryScore}%`;
          const publicWidth = `${p.publicScore}%`;

          return (
            <li key={p.id} className="ranking-item">
              <span
                className="ranking-item__pos"
                style={{ background: idx < 3 ? `${medalColor}22` : "var(--muted)", color: medalColor }}
                aria-label={`Posición ${p.position}`}
              >
                {p.position}
              </span>

              <div className="ranking-item__info">
                <div className="ranking-item__name-row">
                  <span className="ranking-item__name">{p.name}</span>
                  <TrendIcon trend={p.trend} />
                  <span className="ranking-item__score">{p.score}%</span>
                </div>

                {/* Barra jurado */}
                <div className="ranking-bar-row">
                  <div className="ranking-bar">
                    <div
                      className="ranking-bar__fill ranking-bar__fill--jury"
                      style={{ width: juryWidth }}
                      role="progressbar"
                      aria-valuenow={p.juryScore}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className="ranking-bar__tag ranking-bar__tag--jury">● Jurado</span>
                </div>

                {/* Barra público */}
                <div className="ranking-bar-row">
                  <div className="ranking-bar">
                    <div
                      className="ranking-bar__fill ranking-bar__fill--public"
                      style={{ width: publicWidth }}
                      role="progressbar"
                      aria-valuenow={p.publicScore}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className="ranking-bar__tag ranking-bar__tag--public">● Público</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
