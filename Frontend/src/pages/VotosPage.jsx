import { useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { EventSidebar } from "../components/layout/EventSidebar";
import {
  ArrowLeft,
  Target,
  Award,
  TrendingUp,
  MessageSquare,
  User,
  ThumbsUp
} from "lucide-react";

import "../index.css";

// --- SUB-COMPONENTES ATÓMICOS ---

const CriterionBar = ({ name, score, maxScore }) => (
  <div>
    <div className="flex justify-between mb-1">
      <span className="font-medium">{name}</span>
      <span className="text-purple-600">{score} / {maxScore}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className="bg-purple-600 h-2 rounded-full transition-all"
        style={{ width: `${(score / maxScore) * 100}%` }}
      />
    </div>
  </div>
);

const CommentCard = ({ author, comment, timestamp, likes }) => (
  <div className="border border-gray-200 rounded-lg p-4">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
        <User className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-medium">{author}</h4>
          <span className="text-xs text-gray-500">{timestamp}</span>
        </div>
        <p className="text-gray-700 text-sm mb-2">{comment}</p>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <ThumbsUp className="w-3 h-3" />
          <span>{likes} personas útil</span>
        </div>
      </div>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const { isPublic, userName } = useContext(AuthContext);

  // Determinar rol (ya que esta página es para participantes, pero puede ser público)
  const userRole = isPublic ? "Público" : "Participante";
  const roleColor = "#9333ea"; // Morado para participante

  // STATE BIEN COLOCADO
  const [publicComments, setPublicComments] = useState([]);

  // FETCH DE COMENTARIOS
  useEffect(() => {
    const fetchComments = async () => {

        const idEventoRaw = localStorage.getItem("eventoId");
      

      try {
        const idVotacion = idEventoRaw; 

        if (!idVotacion) {
          console.warn("No hay idVotacion en localStorage");
          return;
        }

        const res = await fetch(
        `http://localhost:5245/api/comentarios?idVotacion=${idVotacion}`
        );

        if (!res.ok) throw new Error("Error al cargar comentarios");

        const data = await res.json();

        const mapped = (data ?? []).map((c) => ({
          id: c.id,
          author: "Anónimo",
          comment: c.comentario,
          timestamp: new Date(c.fecha).toLocaleString(),
          likes: 0
        }));

        setPublicComments(mapped);
      } catch (err) {
        console.error("Error cargando comentarios:", err);
      }
    };

    fetchComments();
  }, []);

  const state = {
    participantName: userName || localStorage.getItem("userName") || "Usuario",
    projectName: localStorage.getItem("eventoNombre"),
    overallScore: 85.75
  };

  const EVALUATION_CRITERIA = [
    { name: "Innovación", score: 85, maxScore: 100 },
    { name: "Diseño", score: 92, maxScore: 100 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar userRole={userRole} color={roleColor} />

      <div className="pb-[88px] lg:pb-0">
       <EventSidebar userRole={userRole} color={roleColor} />
        {/* HEADER - Participant Style (Purple) - Full Width */}
        <header className="bg-purple-600 text-white p-6 lg:p-10 lg:pl-80">
          <div className="max-w-7xl mx-auto">
            {!isPublic && (
              <button
                onClick={() => navigate("/eventos")}
                className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                Volver a eventos
              </button>
            )}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                    Panel Participante
                  </span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                  {state.projectName}
                </h1>
                <p className="text-purple-100 text-lg font-medium opacity-90">
                  Bienvenido de nuevo, {state.participantName}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <p className="text-xs uppercase tracking-wider font-bold text-purple-200 mb-1">Tu Puntuación Global</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-heading font-bold">{state.overallScore}</p>
                  <p className="text-sm font-medium text-purple-200">/ 100</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 lg:p-10 lg:pl-80 -mt-10 space-y-8">

          {/* PROYECTO Y RESUMEN */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <article className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-heading font-bold text-gray-900">Sobre tu Proyecto</h2>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed">
                {localStorage.getItem("eventoDescripcion") || "Sin descripción disponible para este proyecto."}
              </p>
            </article>

            <article className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center flex flex-col justify-center items-center">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mb-4">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900 mb-2">Reconocimiento</h2>
              <p className="text-gray-500 mb-6">Tu proyecto se encuentra entre los más destacados del evento.</p>
              <span className="px-4 py-2 bg-purple-600 text-white font-bold rounded-full text-sm shadow-lg shadow-purple-200">
                Top 10% del Evento
              </span>
            </article>
          </section>

          {/* CRITERIOS */}
          <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-bold text-gray-900">Evaluación Detallada</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {EVALUATION_CRITERIA.map((item) => (
                <CriterionBar key={item.name} {...item} />
              ))}
            </div>
          </section>

          {/* COMENTARIOS */}
          <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-gray-900">Feedback del Público</h2>
                  <p className="text-sm text-gray-500">Lo que otros participantes y asistentes opinan</p>
                </div>
              </div>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {publicComments.length} Comentarios
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {publicComments.length > 0 ? (
                publicComments.map((comment) => (
                  <CommentCard key={comment.id} {...comment} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                  <p className="text-gray-400 font-medium">Aún no hay comentarios públicos para este proyecto.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
