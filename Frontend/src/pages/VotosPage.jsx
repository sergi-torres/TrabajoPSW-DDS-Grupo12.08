import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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
import { comentariosApi } from "../api/comentariosApi";

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

  // STATE BIEN COLOCADO
  const [publicComments, setPublicComments] = useState([]);

  // FETCH DE COMENTARIOS
  useEffect(() => {
    const fetchComments = async () => {

        const idEventoRaw = localStorage.getItem("eventoId");
        //console.log("idEvento en localStorage:", idEventoRaw);
      

      try {

        const idVotacion = idEventoRaw; // TEMPORAL, MODIFICAR EN EL SPRINT 2



        if (!idVotacion) {
          console.warn("No hay idVotacion en localStorage");
          return;
        }

        const res = await fetch(
        `http://localhost:5245/api/comentarios?idVotacion=${idVotacion}`
        );

        if (!res.ok) throw new Error("Error al cargar comentarios");

       

        const data = await res.json();

        //console.log("comentarios cargados:", data);

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
    participantName: localStorage.getItem("email"),
    projectName: localStorage.getItem("eventoNombre"),
    overallScore: 85.75
  };

  const EVALUATION_CRITERIA = [
    { name: "Innovación", score: 85, maxScore: 100 },
    { name: "Diseño", score: 92, maxScore: 100 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/eventos")}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>

          <h1 className="text-3xl mb-2">Dashboard del Participante</h1>
          <p>Bienvenido, {state.participantName}</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">

        {/* PROYECTO */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Tu Proyecto</h2>
            </div>

            <h3 className="text-2xl mb-3">{state.projectName}</h3>
            <p className="text-gray-600">
              {localStorage.getItem("eventoDescripcion")}
            </p>
          </article>

          <article className="bg-white rounded-lg shadow p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Puntuación</h2>
            </div>

            <div className="text-5xl font-bold text-purple-600 mb-2">
              {state.overallScore}
            </div>

            <p className="text-gray-600">de 100 puntos</p>
            <span className="inline-block mt-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
              Top 10%
            </span>
          </article>
        </section>

        {/* CRITERIOS */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">
              Evaluación por Criterios
            </h2>
          </div>

          <div className="space-y-4">
            {EVALUATION_CRITERIA.map((item) => (
              <CriterionBar key={item.name} {...item} />
            ))}
          </div>
        </section>

        {/* COMENTARIOS */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">
              Comentarios del Público
            </h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Lo que el público opina sobre tu proyecto
          </p>

          <div className="space-y-4">
            {publicComments.map((comment) => (
              <CommentCard key={comment.id} {...comment} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}