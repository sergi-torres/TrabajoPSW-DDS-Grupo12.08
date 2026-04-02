import { ArrowLeft, TrendingUp, Award, Target, MessageSquare, ThumbsUp, User } from "lucide-react";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

// Mock data - Comentarios del público
const publicComments = [
  {
    id: 1,
    author: "Carlos Mendoza",
    comment: "¡Excelente proyecto! La interfaz es muy intuitiva y el diseño es moderno. Me encanta cómo resolvieron el problema de navegación.",
    timestamp: "Hace 2 horas",
    likes: 12,
  },
  {
    id: 2,
    author: "Ana Rodríguez",
    comment: "Muy innovador el enfoque que le dieron. La funcionalidad de búsqueda es impresionante y la experiencia de usuario es fluida.",
    timestamp: "Hace 4 horas",
    likes: 8,
  },
  {
    id: 3,
    author: "Luis Fernández",
    comment: "Gran trabajo en equipo. Se nota la atención al detalle y la pasión que pusieron en cada aspecto del proyecto.",
    timestamp: "Hace 5 horas",
    likes: 15,
  },
  {
    id: 4,
    author: "María González",
    comment: "Me impresionó la presentación y la forma en que explicaron el problema. La solución es elegante y escalable.",
    timestamp: "Hace 6 horas",
    likes: 10,
  },
  {
    id: 5,
    author: "Jorge Ramírez",
    comment: "Felicitaciones por el proyecto. La documentación es clara y el código está muy bien estructurado.",
    timestamp: "Hace 7 horas",
    likes: 6,
  },
  {
    id: 6,
    author: "Patricia Silva",
    comment: "Increíble implementación! Me gustó especialmente cómo manejaron la accesibilidad y la responsividad.",
    timestamp: "Hace 8 horas",
    likes: 9,
  },
];

// Mock data - Evaluaciones
const evaluationCriteria = [
  { name: "Innovación", score: 85, maxScore: 100 },
  { name: "Diseño", score: 92, maxScore: 100 },
  { name: "Funcionalidad", score: 78, maxScore: 100 },
  { name: "Presentación", score: 88, maxScore: 100 },
];

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const participantName = "María López";
  const projectName = "Votify Platform";
  const overallScore = 85.75;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/roles")}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-4xl mb-2">Dashboard del Participante</h1>
          <p className="text-purple-100">Bienvenida, {participantName}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Proyecto y Puntuación General */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 border-purple-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Tu Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl mb-4">{projectName}</h3>
              <p className="text-gray-600">
                Plataforma innovadora de votación y evaluación para eventos competitivos.
                Sistema de gestión integral con experiencia inmersiva para todos los roles.
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-600" />
                Puntuación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-5xl mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {overallScore}
                </div>
                <p className="text-gray-600">de 100 puntos</p>
                <Badge className="mt-4 bg-purple-600">Top 10%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hoja de Ruta - Criterios de Evaluación */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              Hoja de Ruta - Evaluación por Criterios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {evaluationCriteria.map((criteria) => (
              <div key={criteria.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{criteria.name}</span>
                  <span className="text-purple-600">
                    {criteria.score} / {criteria.maxScore}
                  </span>
                </div>
                <Progress value={(criteria.score / criteria.maxScore) * 100} className="h-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Comentarios del Público */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-purple-600" />
              Comentarios del Público
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              Lo que el público opina sobre tu proyecto
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {publicComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{comment.author}</h4>
                        <span className="text-sm text-gray-500">{comment.timestamp}</span>
                      </div>
                      <p className="text-gray-700 mb-3 leading-relaxed">{comment.comment}</p>
                      <div className="flex items-center gap-2 text-gray-500">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{comment.likes} personas encontraron esto útil</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
