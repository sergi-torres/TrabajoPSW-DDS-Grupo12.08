// JavaScript source code

import { ArrowLeft, FolderOpen, Check, Target, Calendar, Users, Code } from "lucide-react";
import { useNavigate } from "react-router";
import { useState } from "react";
import { useVoting } from "../context/VotingContext";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import CreateProject from './CreateProject';
import { PlusCircle } from "lucide-react";

// Mock data - Proyectos del usuario
const userProjects = [
  {
    id: "p1",
    name: "Votify Platform",
    description: "Plataforma innovadora de votación y evaluación para eventos competitivos con experiencia inmersiva para todos los roles.",
    technology: ["React", "TypeScript", "Tailwind CSS"],
    team: 4,
    created: "2026-03-15",
    status: "Finalizado",
    image: "🎯",
  },
  {
    id: "p2",
    name: "EcoTrack App",
    description: "Aplicación móvil para seguimiento de huella de carbono personal con gamificación y recomendaciones inteligentes basadas en IA.",
    technology: ["React Native", "Node.js", "MongoDB"],
    team: 3,
    created: "2026-02-20",
    status: "En desarrollo",
    image: "🌱",
  },
  {
    id: "p3",
    name: "CodeCollab",
    description: "Herramienta colaborativa en tiempo real para pair programming con video integrado y editor compartido de código.",
    technology: ["Vue.js", "WebRTC", "Firebase"],
    team: 5,
    created: "2026-01-10",
    status: "Finalizado",
    image: "💻",
  },
  {
    id: "p4",
    name: "HealthHub",
    description: "Sistema integral de gestión de salud con seguimiento de métricas, citas médicas y recordatorios de medicamentos.",
    technology: ["Angular", "Python", "PostgreSQL"],
    team: 6,
    created: "2025-12-05",
    status: "Finalizado",
    image: "⚕️",
  },
];

export default function RegisterParticipant() {
  const navigate = useNavigate();
  const { categories, eventConfig } = useVoting();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleRegister = () => {
    if (selectedProject && selectedCategory) {
      // Aquí iría la lógica de registro
      alert(`Proyecto registrado exitosamente!\n\nProyecto: ${userProjects.find(p => p.id === selectedProject)?.name}\nCategoría: ${categories.find(c => c.id === selectedCategory)?.name}`);
      navigate("/eventos");
    }
  };

  const selectedProjectData = userProjects.find(p => p.id === selectedProject);
  const isReadyToRegister = selectedProject && selectedCategory;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate("/eventos")}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <div>
            <h1 className="text-4xl mb-2">Registrar Proyecto</h1>
            <p className="text-purple-100">Selecciona tu proyecto para {eventConfig.eventName}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Paso 1: Seleccionar Proyecto */}
        <Card className="border-purple-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-purple-600" />
              Paso 1: Selecciona tu Proyecto
              {selectedProject && (
                <Badge className="bg-purple-600 ml-2">
                  <Check className="w-3 h-3 mr-1" />
                  Seleccionado
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`
                    bg-gradient-to-r from-white to-purple-50/30 border-2 rounded-2xl p-6
                    hover:shadow-xl transition-all cursor-pointer
                    ${selectedProject === project.id
                      ? "border-purple-600 shadow-lg ring-4 ring-purple-200"
                      : "border-purple-100 hover:border-purple-300"
                    }
                  `}
                >
                  <div className="flex items-start gap-6">
                    {/* Icono del Proyecto */}
                    <div className={`
                      w-20 h-20 rounded-2xl flex items-center justify-center text-5xl shadow-lg
                      ${selectedProject === project.id
                        ? "bg-gradient-to-br from-purple-500 to-purple-700"
                        : "bg-gradient-to-br from-purple-100 to-purple-200"
                      }
                    `}>
                      {project.image}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl mb-2 flex items-center gap-3">
                            {project.name}
                            {selectedProject === project.id && (
                              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`
                                ${project.status === "Finalizado"
                                  ? "border-green-300 text-green-700 bg-green-50"
                                  : "border-orange-300 text-orange-700 bg-orange-50"
                                }
                              `}
                            >
                              {project.status}
                            </Badge>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users className="w-4 h-4" />
                              <span>{project.team} miembros</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(project.created).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descripción */}
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {project.description}
                      </p>

                      {/* Tecnologías */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Code className="w-4 h-4 text-purple-600" />
                        {project.technology.map((tech) => (
                          <Badge
                            key={tech}
                            className="bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Paso 2: Seleccionar Categoría (solo visible si hay proyecto seleccionado) */}
        {selectedProject && (
          <Card className="border-purple-200 shadow-lg animate-in slide-in-from-bottom duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-6 h-6 text-purple-600" />
                Paso 2: Selecciona la Categoría del Evento
                {selectedCategory && (
                  <Badge className="bg-purple-600 ml-2">
                    <Check className="w-3 h-3 mr-1" />
                    Seleccionado
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`
                      bg-gradient-to-br from-white to-purple-50 border-2 rounded-2xl p-6
                      hover:shadow-xl transition-all cursor-pointer
                      ${selectedCategory === category.id
                        ? "border-purple-600 shadow-lg ring-4 ring-purple-200"
                        : "border-purple-100 hover:border-purple-300"
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center
                          ${selectedCategory === category.id
                            ? "bg-purple-600"
                            : "bg-purple-100"
                          }
                        `}>
                          <Target className={`w-6 h-6 ${selectedCategory === category.id ? "text-white" : "text-purple-600"}`} />
                        </div>
                        <div>
                          <h4 className="text-xl">{category.name}</h4>
                          <Badge
                            variant="outline"
                            className={`mt-1 ${
                              category.status === "active"
                                ? "border-green-300 text-green-700 bg-green-50"
                                : "border-gray-300 text-gray-600"
                            }`}
                          >
                            {category.status === "active" ? "Activa" : "Pendiente"}
                          </Badge>
                        </div>
                      </div>
                      {selectedCategory === category.id && (
                        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen y Botón de Registro */}
        {selectedProject && selectedCategory && (
          <Card className="border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 animate-in slide-in-from-bottom duration-700">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl mb-4">Resumen del Registro</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Proyecto:</span>
                      <span className="text-gray-700">{selectedProjectData?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Categoría:</span>
                      <span className="text-gray-700">{categories.find(c => c.id === selectedCategory)?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">Evento:</span>
                      <span className="text-gray-700">{eventConfig.eventName} ({eventConfig.eventCode})</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleRegister}
                  disabled={!isReadyToRegister}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-6 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Registrar Proyecto
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje informativo si no hay selección */}
            {!selectedProject && (
            <Card className="border-purple-200 shadow-lg bg-gradient-to-r from-purple-50 to-white">
                <CardContent className="p-8 text-center">
                <FolderOpen className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                <h3 className="text-xl mb-2 text-gray-600">Selecciona un proyecto para comenzar</h3>
            <p className="text-gray-500">
                Elige el proyecto que deseas registrar en {eventConfig.eventName}
            </p>
      
        {/* Línea divisoria */}
            <div className="my-6 border-t border-purple-200"></div>
      
        {/* Enlace para crear nuevo proyecto */}
            <div>
                <p className="text-gray-600 mb-3">¿No encuentras tu proyecto?</p>
                <button
                    onClick={() => navigate("/create-project")}
                    className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                <PlusCircle className="w-5 h-5" />
                Crear proyecto nuevo
                </button>
            </div>
        </CardContent>
    </Card>
    )}


      </div>
    </div>
  );
}
