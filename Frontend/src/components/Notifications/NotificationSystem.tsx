import React, { useEffect } from "react";
import { toast } from "sonner";
import { Play, Pause, StopCircle, CheckCircle, AlertCircle, Trophy } from "lucide-react";

// Configuración de notificaciones por tipo de estado
const notificationConfig: Record<string, any> = {
  voting_started: {
    icon: Play,
    title: "¡Votación Iniciada!",
    description: "La votación ha comenzado",
    color: "text-green-500",
    sound: true,
  },
  voting_paused: {
    icon: Pause,
    title: "Votación Pausada",
    description: "La votación ha sido pausada temporalmente",
    color: "text-orange-500",
    sound: true,
  },
  voting_resumed: {
    icon: Play,
    title: "Votación Reanudada",
    description: "La votación ha sido reanudada",
    color: "text-blue-500",
    sound: true,
  },
  voting_closed: {
    icon: StopCircle,
    title: "Votación Cerrada",
    description: "La votación ha finalizado",
    color: "text-red-500",
    sound: true,
  },
  results_available: {
    icon: Trophy,
    title: "¡Resultados Disponibles!",
    description: "Los resultados de la votación están listos",
    color: "text-purple-500",
    sound: true,
  },
  category_started: {
    icon: Play,
    title: "Nueva Categoría",
    description: "Ha comenzado una nueva categoría",
    color: "text-teal-500",
    sound: true,
  },
  category_closed: {
    icon: CheckCircle,
    title: "Categoría Finalizada",
    description: "La categoría ha sido cerrada",
    color: "text-gray-500",
    sound: false,
  },
};

export function showNotification(payload: any) {
  const config = notificationConfig[payload.state];
  const IconComponent = config.icon;
  
  const message = payload.categoryName 
    ? `${config.description}: ${payload.categoryName}`
    : config.description;

  toast(config.title, {
    description: message,
    icon: <IconComponent className={`w-5 h-5 ${config.color}`} />,
    duration: 5000,
    position: "top-right",
  });
}

// Hook para simular notificaciones en tiempo real
export function useVotingNotifications() {
  useEffect(() => {
    // Simulación de eventos en tiempo real
    const simulateNotifications = () => {
      const events = [
        { state: "category_started", categoryName: "Innovación" },
        { state: "voting_started", categoryName: "Innovación" },
      ];

      // Descomentar para ver notificaciones de prueba
      // events.forEach((event, index) => {
      //   setTimeout(() => showNotification(event), (index + 1) * 3000);
      // });
    };

    simulateNotifications();
  }, []);
}

interface AlertBannerProps {
    state: string;
    categoryName?: string;
    onDismiss?: () => void;
}

// Componente de alerta en pantalla (para cambios importantes)
export function AlertBanner({ state, categoryName, onDismiss }: AlertBannerProps) {
  const config = notificationConfig[state];
  const IconComponent = config.icon;

  const bannerColors: Record<string, string> = {
    voting_started: "bg-green-50 border-green-500 text-green-800",
    voting_paused: "bg-orange-50 border-orange-500 text-orange-800",
    voting_resumed: "bg-blue-50 border-blue-500 text-blue-800",
    voting_closed: "bg-red-50 border-red-500 text-red-800",
    results_available: "bg-purple-50 border-purple-500 text-purple-800",
    category_started: "bg-teal-50 border-teal-500 text-teal-800",
    category_closed: "bg-gray-50 border-gray-500 text-gray-800",
  };

  return (
    <div className={`${bannerColors[state]} border-l-4 p-4 rounded-r-xl shadow-lg flex items-center justify-between animate-in slide-in-from-top duration-300`}>
      <div className="flex items-center gap-3">
        <IconComponent className="w-6 h-6" />
        <div>
          <h4 className="font-medium">{config.title}</h4>
          <p className="text-sm">
            {categoryName ? `${config.description}: ${categoryName}` : config.description}
          </p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="hover:opacity-70 transition-opacity"
        >
          <AlertCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}