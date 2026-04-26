// src/components/dashboard/ProjectFeed.tsx
import { Clock, FileText, Video, Layout, Eye } from "lucide-react";

const TYPE_ICONS: Record<string, any> = {
  pdf: FileText,
  video: Video,
  mockup: Layout,
};

const TYPE_COLORS: Record<string, string> = {
  pdf: "rgba(239,68,68,0.12)",
  video: "rgba(139,92,246,0.12)",
  mockup: "rgba(59,130,246,0.12)",
};

const TYPE_ICON_COLORS: Record<string, string> = {
  pdf: "#EF4444",
  video: "#8B5CF6",
  mockup: "#3B82F6",
};

const STATUS_LABELS: Record<string, string> = {
  ready: "Listo para Evaluar",
  pending: "Pendiente",
  reviewing: "En Revisión",
};

const STATUS_CLASSES: Record<string, string> = {
  ready: "status-badge status-badge--ready",
  pending: "status-badge status-badge--pending",
  reviewing: "status-badge status-badge--reviewing",
};

interface FeedItem {
    id: number | string;
    type: string;
    title: string;
    team: string;
    minutesAgo: number;
    status: string;
}

interface ProjectFeedProps {
    items: FeedItem[];
    updatedMinutesAgo?: number;
    onViewDetails?: (item: FeedItem) => void;
}

export default function ProjectFeed({ items, updatedMinutesAgo = 1, onViewDetails }: ProjectFeedProps) {
  return (
    <section className="dashboard-card feed-card">
      <div className="dashboard-card__header">
        <Clock size={20} strokeWidth={1.75} style={{ color: "var(--color-org)" }} />
        <h2 className="dashboard-card__title">Feed de Proyectos Recientes</h2>
        <span className="feed-updated">Actualizado hace {updatedMinutesAgo}m</span>
      </div>

      <ul className="feed-list" aria-label="Feed de proyectos recientes">
        {items.map((item) => {
          const Icon = TYPE_ICONS[item.type] ?? FileText;
          const iconBg = TYPE_COLORS[item.type] ?? "rgba(0,0,0,0.06)";
          const iconColor = TYPE_ICON_COLORS[item.type] ?? "#333";

          return (
            <li key={item.id} className="feed-item">
              <div
                className="feed-item__icon"
                style={{ background: iconBg, color: iconColor }}
                aria-hidden="true"
              >
                <Icon size={18} strokeWidth={1.75} />
              </div>

              <div className="feed-item__body">
                <div className="feed-item__top">
                  <div>
                    <p className="feed-item__title">{item.title}</p>
                    <p className="feed-item__team">por {item.team}</p>
                  </div>
                  <span className="feed-item__time">{item.minutesAgo}m</span>
                </div>
                <div className="feed-item__bottom">
                  <span className={STATUS_CLASSES[item.status]}>
                    {STATUS_LABELS[item.status]}
                  </span>
                  <button
                    className="btn btn--outline-small"
                    onClick={() => onViewDetails?.(item)}
                    aria-label={`Ver detalles de ${item.title}`}
                  >
                    <Eye size={14} strokeWidth={2} />
                    Ver Detalles
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
