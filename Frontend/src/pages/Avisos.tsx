import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { EventContext } from "../context/EventContext";
import { EventSidebar } from "../components/layout/EventSidebar";
import { MobileNav } from "../components/eventos/MobileNav";
import { 
  ArrowLeft, 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Play, 
  Pause, 
  StopCircle, 
  Trophy,
  Trash2,
  CheckCheck
} from "lucide-react";
import { cn } from "../components/ui/utils";

// ============================================
// TIPOS
// ============================================

interface Notification {
  id: string;
  state: string;
  categoryName?: string;
  timestamp: Date;
  read: boolean;
}

// ============================================
// CONFIGURACIÓN DE NOTIFICACIONES
// ============================================

const notificationConfig: Record<string, any> = {
  voting_started: {
    icon: Play,
    title: "¡Votación Iniciada!",
    description: "La votación ha comenzado",
    color: "text-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-500",
    sound: true,
  },
  voting_paused: {
    icon: Pause,
    title: "Votación Pausada",
    description: "La votación ha sido pausada temporalmente",
    color: "text-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-500",
    sound: true,
  },
  voting_resumed: {
    icon: Play,
    title: "Votación Reanudada",
    description: "La votación ha sido reanudada",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-500",
    sound: true,
  },
  voting_closed: {
    icon: StopCircle,
    title: "Votación Cerrada",
    description: "La votación ha finalizado",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    sound: true,
  },
  results_available: {
    icon: Trophy,
    title: "¡Resultados Disponibles!",
    description: "Los resultados de la votación están listos",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-500",
    sound: true,
  },
  category_started: {
    icon: Play,
    title: "Nueva Categoría",
    description: "Ha comenzado una nueva categoría",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
    borderColor: "border-teal-500",
    sound: true,
  },
  category_closed: {
    icon: CheckCircle,
    title: "Categoría Finalizada",
    description: "La categoría ha sido cerrada",
    color: "text-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-500",
    sound: false,
  },
    project_deleted: {
    icon: Trash2,
    title: "Proyecto Eliminado",
    description: "El proyecto ha sido eliminado",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-500",
    sound: true,
  },
  project_registered: {
      icon: CheckCircle,
      title: "¡Proyecto Registrado!",
      description: "Has registrado un nuevo proyecto",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      sound: true,
  },
  event_created: {
      icon: CheckCircle,
      title: "¡Evento Creado!",
      description: "Has creado un nuevo evento",
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-500",
      sound: true,
  },
  category_changed: {
      icon: AlertCircle,
      title: "¡Cambio de Categoría!",
      description: "Una categoría ha cambiado de estado",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-500",
      sound: false,
  }
};

// ============================================
// COMPONENTE DE NOTIFICACIÓN INDIVIDUAL
// ============================================

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete 
}: { 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const config = notificationConfig[notification.state];
  if (!config) return null;

  const IconComponent = config.icon;
  const isUnread = !notification.read;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border transition-all",
        config.bgColor,
        config.borderColor,
        isUnread && "shadow-md"
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <IconComponent className={cn("w-5 h-5", config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                {notification.categoryName 
                  ? `${config.description}: ${notification.categoryName}`
                  : config.description}
              </p>
            </div>
            {isUnread && (
              <div className="w-2 h-2 bg-purple-600 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">
              {new Date(notification.timestamp).toLocaleString()}
            </span>
            <div className="flex gap-2">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  <CheckCheck size={14} />
                  Marcar como leído
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
              >
                <Trash2 size={14} />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function AvisosPage() {
  const navigate = useNavigate();
  const { isPublic, userName } = useContext(AuthContext)!;
  const { userColor, isCollapsed, userRole } = useContext(EventContext)!;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const isPublicRole = userRole === "Público";
  const themeColor = "#2563EB";

  // Cargar notificaciones desde localStorage (o desde API)
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem("notifications");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convertir timestamp string a Date
        const withDates = parsed.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(withDates);
      } else {
        // No hay notificaciones almacenadas
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  // Marcar como leída
  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // Eliminar notificación
  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  // Eliminar todas
  const deleteAll = () => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
  };

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  //console.log("Notificaciones cargadas:", notifications);

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      {/* {!isPublicRole && <EventSidebar />} */} 

      <div className="pb-[120px] lg:pb-12">
        <header
          className={cn(
            "text-white p-6 lg:p-10 transition-all duration-300",
          )}
          style={{ backgroundColor: themeColor }}
        >
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate("/eventos")}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
              Volver a eventos
            </button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
                  Avisos
                </h1>
                <p className="opacity-90 text-lg font-medium">
                  Mantente informado sobre tu evento
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-2">
                <Bell size={18} />
                <span className="font-bold">{unreadCount}</span>
                <span className="text-sm">no leídos</span>
              </div>
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-4xl mx-auto p-6 lg:p-10 -mt-6 transition-all duration-300",
          
        )}>
          {/* Barra de acciones */}
          <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filter === "all"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilter("unread")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filter === "unread"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  No leídas
                </button>
                <button
                  onClick={() => setFilter("read")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    filter === "read"
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Leídas
                </button>
              </div>
              
              <div className="flex gap-2">
                {notifications.length > 0 && (
                  <>
                    <button
                      onClick={markAllAsRead}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-all"
                    >
                      <CheckCheck size={16} />
                      Marcar todas
                    </button>
                    <button
                      onClick={deleteAll}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={16} />
                      Eliminar todas
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Lista de notificaciones */}
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 border border-gray-100 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No hay avisos
              </h3>
              <p className="text-gray-500">
                {filter === "all" && "No tienes ninguna notificación."}
                {filter === "unread" && "No tienes notificaciones no leídas."}
                {filter === "read" && "No tienes notificaciones leídas."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))}
            </div>
          )}

          {/* Leyenda */}
          {notifications.length > 0 && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Los avisos importantes sobre votaciones, categorías y resultados aparecerán aquí.
              </p>
            </div>
          )}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}