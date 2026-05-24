import { useState, useEffect, useContext } from "react";
import { API_BASE_URL } from "../../config/api";
import { EventContext } from "../../context/EventContext";
import { comentariosApi } from "../../api/comentariosApi";
import { categoriasApi } from "../../api/categoriasApi";
import {
  MessageSquare,
  Users,
  Gavel,
  Globe,
  Clock,
  ThumbsUp,
  Tag,
} from "lucide-react";
import "./ComentariosProyecto.css";

// ─── TYPES ───────────────────────────────────────────────────────

interface Comentario {
  id: number;
  comentario: string;
  fecha: string;
  criterio: string;
  categoriaNombre: string;
  likes?: number;
}

interface UsuarioComentarios {
  referencia: string;
  nombre: string;
  iniciales: string;
  comentarios: Comentario[];
}

interface TipoComentarista {
  tipo: "Jurado" | "Público";
  totalComentarios: number;
  usuarios: UsuarioComentarios[];
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────

interface ComentariosProyectoProps {
  themeColor: string;
}

export default function ComentariosProyecto({ themeColor }: ComentariosProyectoProps) {
  const { eventoId } = useContext(EventContext)!;
  const [comentariosPorTipo, setComentariosPorTipo] = useState<TipoComentarista[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchAllComments = async () => {
      setCargando(true);
      const idProyecto = localStorage.getItem("proyectoId");
      if (!idProyecto || !eventoId) {
        setCargando(false);
        return;
      }

      try {
        // 1. Obtener todas las categorías para tener los nombres
        const allCats = await categoriasApi.getByEvento(Number(eventoId));
        const catMap = new Map(allCats.map(c => [c.id, c.nombre]));

        // 2. Obtener los votos básicos del proyecto para identificar categorías con comentarios
        const votoRes = await fetch(`${API_BASE_URL}/api/votacion/porProyecto?proyectoId=${idProyecto}`);
        const votosBasicos: any[] = await votoRes.json();
        
        const catIds = Array.from(new Set(votosBasicos.map(v => v.idcategoria || v.categoriaId)));

        // 3. Cargar el resumen jerárquico de cada categoría que tenga votos
        const resultadosCompletos: TipoComentarista[] = [
          { tipo: "Jurado", totalComentarios: 0, usuarios: [] },
          { tipo: "Público", totalComentarios: 0, usuarios: [] }
        ];

        for (const catId of catIds) {
          const catNombre = catMap.get(catId) || "General";
          const resumen: TipoComentarista[] = await comentariosApi.getResumen(Number(idProyecto), catId);

          for (const tipoRes of resumen) {
            const index = resultadosCompletos.findIndex(t => t.tipo === tipoRes.tipo);
            if (index === -1) continue;

            for (const userRes of tipoRes.usuarios) {
              // Cargar detalle de este usuario en esta categoría
              const detailedComments = await comentariosApi.getDetalleUsuario(Number(idProyecto), catId, userRes.referencia);
              
              // Mapear comentarios añadiendo el nombre de la categoría
              const mappedComments: Comentario[] = detailedComments.map((c: any) => ({
                ...c,
                categoriaNombre: catNombre
              }));

              // Buscar si el usuario ya existe en nuestra lista acumulada (por si comenta en varias categorías)
              let existingUser = resultadosCompletos[index].usuarios.find(u => u.referencia === userRes.referencia);
              
              if (existingUser) {
                existingUser.comentarios.push(...mappedComments);
              } else {
                resultadosCompletos[index].usuarios.push({
                  ...userRes,
                  comentarios: mappedComments
                });
              }
              
              resultadosCompletos[index].totalComentarios += mappedComments.length;
            }
          }
        }

        // Filtrar tipos que no tengan comentarios
        setComentariosPorTipo(resultadosCompletos.filter(t => t.totalComentarios > 0));

      } catch (err) {
        console.error("Error cargando comentarios unificados:", err);
      } finally {
        setCargando(false);
      }
    };

    fetchAllComments();
  }, [eventoId]);

  // Deterministic avatar color logic
  const avatarColors = ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];
  const getAvatarColor = (name: string) => {
    const sum = name.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    return avatarColors[sum % avatarColors.length];
  };

  const totalGlobal = comentariosPorTipo.reduce((acc, t) => acc + t.totalComentarios, 0);

  return (
    <section className="comentarios-root bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="comentarios-root__header">
        <div className="flex items-center gap-3">
          <div className="comentarios-root__icon" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-gray-900">Comentarios Recibidos</h2>
            <p className="text-sm text-gray-500">Todo el feedback de tu proyecto en un solo lugar</p>
          </div>
        </div>
        <span className="comentarios-root__total-badge" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
          {totalGlobal}
        </span>
      </div>

      <div className="comentarios-root__content">
        {cargando ? (
          <div className="comentarios-loading">
            <div className="comentarios-loading__spinner" style={{ borderTopColor: themeColor }} />
            <p>Cargando feedback…</p>
          </div>
        ) : comentariosPorTipo.length > 0 ? (
          <div className="comentarios-list">
            {comentariosPorTipo.map((tipo) => (
              <div key={tipo.tipo} className="comentarios-group">
                <div className="comentarios-group__label">
                  {tipo.tipo === "Jurado" ? <Gavel className="w-4 h-4 text-orange-500" /> : <Globe className="w-4 h-4 text-emerald-500" />}
                  <span className="font-bold">Comentarios del {tipo.tipo}</span>
                  <span className="comentarios-group__count">({tipo.totalComentarios})</span>
                </div>
                
                {tipo.usuarios.map((user) => (
                  <div key={user.referencia} className="comentarios-user-block">
                    {user.comentarios.map((comment) => (
                      <article key={comment.id} className="comentario-item">
                        <div className="comentario-item__header">
                          <div className="comentario-item__avatar" style={{ backgroundColor: getAvatarColor(user.referencia) }}>
                            {user.iniciales}
                          </div>
                          <div className="comentario-item__meta">
                            <div className="flex items-center gap-2">
                                <h4 className="comentario-item__author">{user.nombre}</h4>
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                    <Tag className="w-2.5 h-2.5" />
                                    {comment.categoriaNombre}
                                </span>
                            </div>
                            <div className="comentario-item__tags">
                              <span className="comentario-item__badge" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>
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
                            <span>{comment.likes} personas encontraron esto útil</span>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="comentarios-empty">
            <Users className="w-10 h-10 text-gray-300" />
            <p>Aún no has recibido comentarios</p>
          </div>
        )}
      </div>
    </section>
  );
}
