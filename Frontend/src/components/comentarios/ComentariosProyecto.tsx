import { useState, useEffect, useContext } from "react";
import { EventContext } from "../../context/EventContext";
import { categoriasApi } from "../../api/categoriasApi";
import {
  MessageSquare,
  Users,
  Gavel,
  Globe,
  User,
  ChevronRight,
  ArrowLeft,
  Filter,
  Clock,
  ThumbsUp,
  MessageCircle,
  Layers,
} from "lucide-react";
import { cn } from "../ui/utils";
import "./ComentariosProyecto.css";

// ─── TYPES ───────────────────────────────────────────────────────

interface Comentario {
  id: number;
  autor: string;
  comentario: string;
  fecha: string;
  criterio: string;
  likes?: number;
}

interface UsuarioComentarios {
  nombre: string;
  iniciales: string;
  totalComentarios: number;
  comentarios: Comentario[];
}

interface TipoComentarista {
  tipo: "Jurado" | "Público";
  totalComentarios: number;
  usuarios: UsuarioComentarios[];
}

interface CategoriaComentarios {
  id: number;
  nombre: string;
  totalComentarios: number;
  tipos: TipoComentarista[];
}

// ─── STEP COMPONENTS ─────────────────────────────────────────────

/** Step 1: Categorías — select the evaluation category */
function PasoCategorias({
  categorias,
  onSelect,
  themeColor,
}: {
  categorias: CategoriaComentarios[];
  onSelect: (cat: CategoriaComentarios) => void;
  themeColor: string;
}) {
  return (
    <div className="comentarios-step comentarios-step--enter">
      <div className="comentarios-step__header">
        <div className="comentarios-step__icon" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
          <Layers className="w-5 h-5" />
        </div>
        <div>
          <h3 className="comentarios-step__title">Categorías</h3>
          <p className="comentarios-step__subtitle">Selecciona una categoría para ver los comentarios recibidos</p>
        </div>
      </div>

      <div className="comentarios-grid">
        {categorias.length > 0 ? (
          categorias.map((cat) => (
            <button
              key={cat.id}
              className="comentarios-card comentarios-card--interactive"
              onClick={() => onSelect(cat)}
            >
              <div className="comentarios-card__body">
                <div className="comentarios-card__icon-wrap" style={{ backgroundColor: `${themeColor}10` }}>
                  <MessageSquare className="w-5 h-5" style={{ color: themeColor }} />
                </div>
                <div className="comentarios-card__info">
                  <span className="comentarios-card__name">{cat.nombre}</span>
                  <span className="comentarios-card__count">
                    {cat.totalComentarios} {cat.totalComentarios === 1 ? "comentario" : "comentarios"}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 comentarios-card__chevron" />
            </button>
          ))
        ) : (
          <div className="comentarios-empty">
            <MessageSquare className="w-10 h-10 text-gray-300" />
            <p>No hay categorías con comentarios disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step 2: Tipo — choose between Jurado or Público */
function PasoTipo({
  categoria,
  onSelect,
  onBack,
  themeColor,
}: {
  categoria: CategoriaComentarios;
  onSelect: (tipo: TipoComentarista) => void;
  onBack: () => void;
  themeColor: string;
}) {
  const iconMap = {
    Jurado: <Gavel className="w-6 h-6" />,
    Público: <Globe className="w-6 h-6" />,
  };

  const colorMap: Record<string, string> = {
    Jurado: "#F97316",
    Público: "#10B981",
  };

  return (
    <div className="comentarios-step comentarios-step--enter">
      <div className="comentarios-step__header">
        <button onClick={onBack} className="comentarios-back-btn">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="comentarios-step__title">{categoria.nombre}</h3>
          <p className="comentarios-step__subtitle">¿De quién quieres ver los comentarios?</p>
        </div>
      </div>

      <div className="comentarios-grid comentarios-grid--2col">
        {categoria.tipos.map((tipo) => {
          const color = colorMap[tipo.tipo] || themeColor;
          return (
            <button
              key={tipo.tipo}
              className="comentarios-card comentarios-card--interactive comentarios-card--featured"
              onClick={() => onSelect(tipo)}
            >
              <div className="comentarios-card__featured-icon" style={{ backgroundColor: `${color}15`, color }}>
                {iconMap[tipo.tipo]}
              </div>
              <div className="comentarios-card__featured-info">
                <span className="comentarios-card__featured-label">Comentarios del</span>
                <span className="comentarios-card__featured-name">{tipo.tipo}</span>
                <span className="comentarios-card__count" style={{ color }}>
                  {tipo.totalComentarios} {tipo.totalComentarios === 1 ? "comentario" : "comentarios"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 comentarios-card__chevron" />
            </button>
          );
        })}

        {categoria.tipos.length === 0 && (
          <div className="comentarios-empty comentarios-empty--col-span">
            <Users className="w-10 h-10 text-gray-300" />
            <p>No hay comentarios en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step 3: Usuarios — select a user to see their comments */
function PasoUsuarios({
  tipo,
  categoriaNombre,
  onSelect,
  onBack,
  themeColor,
}: {
  tipo: TipoComentarista;
  categoriaNombre: string;
  onSelect: (user: UsuarioComentarios) => void;
  onBack: () => void;
  themeColor: string;
}) {
  const avatarColors = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
    "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#06B6D4",
  ];

  return (
    <div className="comentarios-step comentarios-step--enter">
      <div className="comentarios-step__header">
        <button onClick={onBack} className="comentarios-back-btn">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h3 className="comentarios-step__title">
            {tipo.tipo === "Jurado" ? "Miembros del Jurado" : "Votantes del Público"}
          </h3>
          <p className="comentarios-step__subtitle">{categoriaNombre} — {tipo.totalComentarios} comentarios totales</p>
        </div>
      </div>

      <div className="comentarios-usuarios-list">
        {tipo.usuarios.map((user, idx) => {
          const bgColor = avatarColors[idx % avatarColors.length];
          return (
            <button
              key={user.nombre + idx}
              className="comentarios-usuario-card comentarios-card--interactive"
              onClick={() => onSelect(user)}
            >
              <div className="comentarios-usuario-card__avatar" style={{ backgroundColor: bgColor }}>
                <span>{user.iniciales}</span>
              </div>
              <div className="comentarios-usuario-card__info">
                <span className="comentarios-usuario-card__name">{user.nombre}</span>
                <span className="comentarios-usuario-card__detail">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {user.totalComentarios} {user.totalComentarios === 1 ? "comentario" : "comentarios"}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 comentarios-card__chevron" />
            </button>
          );
        })}

        {tipo.usuarios.length === 0 && (
          <div className="comentarios-empty">
            <User className="w-10 h-10 text-gray-300" />
            <p>No hay usuarios con comentarios</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Step 4: Comentarios del usuario — grouped by criterion with filter tabs */
function PasoComentarios({
  usuario,
  categoriaNombre,
  tipoNombre,
  onBack,
  themeColor,
}: {
  usuario: UsuarioComentarios;
  categoriaNombre: string;
  tipoNombre: string;
  onBack: () => void;
  themeColor: string;
}) {
  const [filtroActivo, setFiltroActivo] = useState("Todos");

  // Extract unique criteria
  const criterios = Array.from(new Set(usuario.comentarios.map((c) => c.criterio)));
  const tabs = ["Todos", ...criterios];

  const comentariosFiltrados =
    filtroActivo === "Todos"
      ? usuario.comentarios
      : usuario.comentarios.filter((c) => c.criterio === filtroActivo);

  const avatarColors = [
    "#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444",
    "#EC4899", "#6366F1", "#14B8A6", "#F97316", "#06B6D4",
  ];

  // Deterministic avatar color from user name
  const charSum = usuario.nombre.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const avatarColor = avatarColors[charSum % avatarColors.length];

  const badgeColorMap: Record<string, string> = {};
  criterios.forEach((c, i) => {
    badgeColorMap[c] = avatarColors[i % avatarColors.length];
  });

  return (
    <div className="comentarios-step comentarios-step--enter">
      {/* Header */}
      <div className="comentarios-step__header comentarios-step__header--rich">
        <button onClick={onBack} className="comentarios-back-btn">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="comentarios-step__header-content">
          <div className="comentarios-step__user-info">
            <div className="comentarios-step__user-avatar" style={{ backgroundColor: avatarColor }}>
              {usuario.iniciales}
            </div>
            <div>
              <h3 className="comentarios-step__title">{usuario.nombre}</h3>
              <p className="comentarios-step__subtitle">
                {tipoNombre} · {categoriaNombre}
              </p>
            </div>
          </div>
          <div className="comentarios-badge-count" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
            {usuario.totalComentarios}
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="comentarios-filters">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="comentarios-filters__tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={cn(
                "comentarios-filter-tab",
                filtroActivo === tab && "comentarios-filter-tab--active"
              )}
              style={filtroActivo === tab ? { backgroundColor: themeColor, borderColor: themeColor } : {}}
              onClick={() => setFiltroActivo(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Comments list */}
      <div className="comentarios-list">
        {comentariosFiltrados.length > 0 ? (
          comentariosFiltrados.map((comment) => {
            const badgeColor = badgeColorMap[comment.criterio] || themeColor;
            return (
              <article key={comment.id} className="comentario-item">
                <div className="comentario-item__header">
                  <div className="comentario-item__avatar" style={{ backgroundColor: avatarColor }}>
                    {usuario.iniciales}
                  </div>
                  <div className="comentario-item__meta">
                    <h4 className="comentario-item__author">{usuario.nombre}</h4>
                    <div className="comentario-item__tags">
                      <span
                        className="comentario-item__badge"
                        style={{ backgroundColor: `${badgeColor}15`, color: badgeColor, borderColor: `${badgeColor}30` }}
                      >
                        {comment.criterio}
                      </span>
                      <span className="comentario-item__time">
                        <Clock className="w-3 h-3" />
                        {comment.fecha}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="comentario-item__text">{comment.comentario}</p>

                {comment.likes !== undefined && comment.likes > 0 && (
                  <div className="comentario-item__footer">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>
                      {comment.likes} {comment.likes === 1 ? "persona" : "personas"} encontraron esto útil
                    </span>
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="comentarios-empty">
            <MessageSquare className="w-10 h-10 text-gray-300" />
            <p>No hay comentarios para este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── BREADCRUMB ──────────────────────────────────────────────────

function Breadcrumb({
  items,
  onNavigate,
  themeColor,
}: {
  items: string[];
  onNavigate: (idx: number) => void;
  themeColor: string;
}) {
  return (
    <nav className="comentarios-breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="comentarios-breadcrumb__item">
          {i > 0 && <ChevronRight className="w-3 h-3 text-gray-400 mx-1" />}
          {i < items.length - 1 ? (
            <button
              className="comentarios-breadcrumb__link"
              onClick={() => onNavigate(i)}
            >
              {item}
            </button>
          ) : (
            <span className="comentarios-breadcrumb__current" style={{ color: themeColor }}>
              {item}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

interface ComentariosProyectoProps {
  themeColor: string;
}

export default function ComentariosProyecto({ themeColor }: ComentariosProyectoProps) {
  const { eventoId } = useContext(EventContext)!;

  const [paso, setPaso] = useState<"categorias" | "tipo" | "usuarios" | "comentarios">("categorias");
  const [categorias, setCategorias] = useState<CategoriaComentarios[]>([]);
  const [cargando, setCargando] = useState(true);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<CategoriaComentarios | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoComentarista | null>(null);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<UsuarioComentarios | null>(null);

  // Fetch categories and comments from the API
  useEffect(() => {
    const fetchData = async () => {
      setCargando(true);
      const idProyecto = localStorage.getItem("proyectoId");

      if (!idProyecto || !eventoId) {
        setCargando(false);
        return;
      }

      try {
        // 1. Get categories for the event
        const cats = await categoriasApi.getByEvento(Number(eventoId));

        // 2. Get votes for the project
        const votoRes = await fetch(
          `http://localhost:5245/api/votacion/porProyecto?proyectoId=${idProyecto}`
        );

        if (!votoRes.ok) {
          setCategorias([]);
          setCargando(false);
          return;
        }

        const votos: any[] = await votoRes.json();

        // 3. For each vote, fetch detailed comments
        const comentariosPromises = votos.map((voto: any) =>
          fetch(`http://localhost:5245/api/comentarios?idVotacion=${voto.id}`)
            .then((res) => (res.ok ? res.json() : []))
            .catch(() => [])
        );
        const resultadosComentarios = await Promise.all(comentariosPromises);

        // Merge comments with vote info
        const allComments: any[] = [];
        votos.forEach((voto: any, idx: number) => {
          const comentariosDetallados = resultadosComentarios[idx] || [];

          if (comentariosDetallados.length > 0) {
            comentariosDetallados.forEach((c: any) => {
              allComments.push({
                id: c.id,
                autor: c.nombreUsuario || voto.nombreUsuario || voto.email || "Anónimo",
                comentario: c.comentario,
                fecha: c.fecha || voto.fechaVoto || voto.fecha,
                criterio: c.nombreCriterio || "General",
                likes: c.likes ?? 0,
                categoriaId: voto.idcategoria || voto.categoriaId,
                tipoEvaluador: voto.tipoEvaluador || (voto.idUsuario ? "Jurado" : "Público"),
              });
            });
          } else if (voto.comentario && voto.comentario.trim() !== "") {
            allComments.push({
              id: voto.id,
              autor: voto.nombreUsuario || voto.email || "Anónimo",
              comentario: voto.comentario,
              fecha: voto.fechaVoto || voto.fecha,
              criterio: voto.nombreCriterio || "General",
              likes: 0,
              categoriaId: voto.idcategoria || voto.categoriaId,
              tipoEvaluador: voto.tipoEvaluador || (voto.idUsuario ? "Jurado" : "Público"),
            });
          }
        });

        // 4. Build the hierarchical structure: Categoría → Tipo → Usuario → Comentarios
        const categoriasMap = new Map<number, CategoriaComentarios>();

        cats.forEach((cat: any) => {
          categoriasMap.set(cat.id, {
            id: cat.id,
            nombre: cat.nombre,
            totalComentarios: 0,
            tipos: [],
          });
        });

        // Add a "Global" category for comments without a category
        if (!categoriasMap.has(0)) {
          categoriasMap.set(0, {
            id: 0,
            nombre: "Global",
            totalComentarios: 0,
            tipos: [],
          });
        }

        allComments.forEach((comment) => {
          const catId = comment.categoriaId || 0;
          let catEntry = categoriasMap.get(catId);
          if (!catEntry) {
            catEntry = categoriasMap.get(0)!;
          }

          const tipoNombre = comment.tipoEvaluador === "Jurado" ? "Jurado" : "Público";
          let tipoEntry = catEntry.tipos.find((t) => t.tipo === tipoNombre);
          if (!tipoEntry) {
            tipoEntry = { tipo: tipoNombre as "Jurado" | "Público", totalComentarios: 0, usuarios: [] };
            catEntry.tipos.push(tipoEntry);
          }

          const autorNombre = comment.autor;
          let userEntry = tipoEntry.usuarios.find((u) => u.nombre === autorNombre);
          if (!userEntry) {
            const iniciales = autorNombre
              .split(/[\s@]+/)
              .slice(0, 2)
              .map((s: string) => s[0]?.toUpperCase() || "")
              .join("");
            userEntry = { nombre: autorNombre, iniciales: iniciales || "?", totalComentarios: 0, comentarios: [] };
            tipoEntry.usuarios.push(userEntry);
          }

          const fechaStr = comment.fecha
            ? new Date(comment.fecha).toLocaleString("es-ES", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          userEntry.comentarios.push({
            id: comment.id,
            autor: comment.autor,
            comentario: comment.comentario,
            fecha: fechaStr,
            criterio: comment.criterio,
            likes: comment.likes,
          });

          userEntry.totalComentarios++;
          tipoEntry.totalComentarios++;
          catEntry.totalComentarios++;
        });

        // Filter out categories with zero comments
        const result = Array.from(categoriasMap.values()).filter((c) => c.totalComentarios > 0);
        setCategorias(result);
      } catch (err) {
        console.error("Error cargando comentarios jerárquicos:", err);
        setCategorias([]);
      } finally {
        setCargando(false);
      }
    };

    fetchData();
  }, [eventoId]);

  // ─── Breadcrumb items ──────────────────────────────
  const breadcrumbItems: string[] = ["Comentarios"];
  if (categoriaSeleccionada) breadcrumbItems.push(categoriaSeleccionada.nombre);
  if (tipoSeleccionado) breadcrumbItems.push(tipoSeleccionado.tipo);
  if (usuarioSeleccionado) breadcrumbItems.push(usuarioSeleccionado.nombre);

  const handleBreadcrumbNav = (idx: number) => {
    if (idx === 0) {
      setPaso("categorias");
      setCategoriaSeleccionada(null);
      setTipoSeleccionado(null);
      setUsuarioSeleccionado(null);
    } else if (idx === 1) {
      setPaso("tipo");
      setTipoSeleccionado(null);
      setUsuarioSeleccionado(null);
    } else if (idx === 2) {
      setPaso("usuarios");
      setUsuarioSeleccionado(null);
    }
  };

  // Total comments across all categories
  const totalComentarios = categorias.reduce((acc, c) => acc + c.totalComentarios, 0);

  return (
    <section className="comentarios-root bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Section header */}
      <div className="comentarios-root__header">
        <div className="flex items-center gap-3">
          <div className="comentarios-root__icon" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-900">Comentarios Recibidos</h2>
            <p className="text-sm text-gray-500">Explora los comentarios organizados por categoría, tipo y usuario</p>
          </div>
        </div>
        <span
          className="comentarios-root__total-badge"
          style={{ backgroundColor: `${themeColor}12`, color: themeColor }}
        >
          {totalComentarios}
        </span>
      </div>

      {/* Breadcrumb */}
      {paso !== "categorias" && (
        <Breadcrumb items={breadcrumbItems} onNavigate={handleBreadcrumbNav} themeColor={themeColor} />
      )}

      {/* Content */}
      <div className="comentarios-root__content">
        {cargando ? (
          <div className="comentarios-loading">
            <div className="comentarios-loading__spinner" style={{ borderTopColor: themeColor }} />
            <p>Cargando comentarios…</p>
          </div>
        ) : (
          <>
            {paso === "categorias" && (
              <PasoCategorias
                categorias={categorias}
                onSelect={(cat) => {
                  setCategoriaSeleccionada(cat);
                  setPaso("tipo");
                }}
                themeColor={themeColor}
              />
            )}

            {paso === "tipo" && categoriaSeleccionada && (
              <PasoTipo
                categoria={categoriaSeleccionada}
                onSelect={(tipo) => {
                  setTipoSeleccionado(tipo);
                  setPaso("usuarios");
                }}
                onBack={() => {
                  setCategoriaSeleccionada(null);
                  setPaso("categorias");
                }}
                themeColor={themeColor}
              />
            )}

            {paso === "usuarios" && tipoSeleccionado && categoriaSeleccionada && (
              <PasoUsuarios
                tipo={tipoSeleccionado}
                categoriaNombre={categoriaSeleccionada.nombre}
                onSelect={(user) => {
                  setUsuarioSeleccionado(user);
                  setPaso("comentarios");
                }}
                onBack={() => {
                  setTipoSeleccionado(null);
                  setPaso("tipo");
                }}
                themeColor={themeColor}
              />
            )}

            {paso === "comentarios" && usuarioSeleccionado && categoriaSeleccionada && tipoSeleccionado && (
              <PasoComentarios
                usuario={usuarioSeleccionado}
                categoriaNombre={categoriaSeleccionada.nombre}
                tipoNombre={tipoSeleccionado.tipo}
                onBack={() => {
                  setUsuarioSeleccionado(null);
                  setPaso("usuarios");
                }}
                themeColor={themeColor}
              />
            )}
          </>
        )}
      </div>
    </section>
  );
}
