import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useContext } from "react";
import { AlertTriangle, Home, LogIn } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { BrowserRouter } from 'react-router-dom'; 
import App from '../App';
import '../index.css';

// Mock data - Comentarios del público

// Mock data simplificado - Solo 3 comentarios
const publicComments = [
  {
    id: 1,
    author: "Carlos Mendoza",
    comment: "¡Excelente proyecto! La interfaz es muy intuitiva.",
    timestamp: "Hace 2 horas",
    likes: 12,
  },
  {
    id: 2,
    author: "Ana Rodríguez",
    comment: "Muy innovador el enfoque que le dieron.",
    timestamp: "Hace 4 horas",
    likes: 8,
  },
  {
    id: 3,
    author: "Luis Fernández",
    comment: "Gran trabajo en equipo. Felicitaciones.",
    timestamp: "Hace 5 horas",
    likes: 15,
  },
];

// Mock data simplificado - Solo 2 criterios
const evaluationCriteria = [
  { name: "Innovación", score: 85, maxScore: 100 },
  { name: "Diseño", score: 92, maxScore: 100 },
];

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const participantName = "María López";
  const projectName = "Votify Platform";
  const overallScore = 85.75;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplificado */}
      <div className="bg-purple-600 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/roles")}
            className="flex items-center gap-2 mb-4 hover:opacity-80"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-3xl mb-2">Dashboard del Participante</h1>
          <p>Bienvenida, {participantName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Proyecto y Puntuación - Grid simplificado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta del Proyecto */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Tu Proyecto</h2>
            </div>
            <h3 className="text-2xl mb-3">{projectName}</h3>
            <p className="text-gray-600">
              Plataforma innovadora de votación y evaluación para eventos competitivos.
            </p>
          </div>

          {/* Tarjeta de Puntuación */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-semibold">Puntuación</h2>
            </div>
            <div className="text-5xl font-bold text-purple-600 mb-2">
              {overallScore}
            </div>
            <p className="text-gray-600">de 100 puntos</p>
            <span className="inline-block mt-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
              Top 10%
            </span>
          </div>
        </div>

        {/* Criterios de Evaluación - Barra de progreso manual */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Evaluación por Criterios</h2>
          </div>
          
          <div className="space-y-4">
            {evaluationCriteria.map((criteria) => (
              <div key={criteria.name}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{criteria.name}</span>
                  <span className="text-purple-600">
                    {criteria.score} / {criteria.maxScore}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${(criteria.score / criteria.maxScore) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comentarios simplificados */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold">Comentarios del Público</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Lo que el público opina sobre tu proyecto
          </p>

          <div className="space-y-4">
            {publicComments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{comment.author}</h4>
                      <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    </div>
                    <p className="text-gray-700 text-sm mb-2">{comment.comment}</p>
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comment.likes} personas encontraron esto útil</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}