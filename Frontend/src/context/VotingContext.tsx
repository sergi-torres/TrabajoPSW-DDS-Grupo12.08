import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { showNotification } from "../components/Notifications/NotificationSystem";
import { categoriasApi } from "../api/categoriasApi";

export interface Category {
  id: string | number;
  name: string;
  status: "active" | "pending" | "closed" | "paused";
  startTime?: Date;
  endTime?: Date;
}

export interface Notification {
  id: string;
  state: string;
  categoryName?: string;
  timestamp: Date;
  read: boolean;
}

export interface EventConfig {
  voteLimit: number;
  eventName: string;
  eventCode: string;
  allowComments: boolean;
}

export interface VotingContextType {
  categories: Category[];
  currentCategory: Category | null;
  eventStatus: "not_started" | "in_progress" | "paused" | "closed" | "results";
  notifications: Notification[];
  eventConfig: EventConfig;
  loading: boolean;
  startCategory: (categoryId: string | number) => void;
  closeCategory: (categoryId: string | number) => void;
  pauseVoting: () => void;
  resumeVoting: () => void;
  closeEvent: () => void;
  showResults: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  updateEventConfig: (config: Partial<EventConfig>) => void;
  addNotification: (state: string, categoryName?: string) => void;
  reloadContext: () => Promise<void>; // ✅ Nuevo método
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [eventStatus, setEventStatus] = useState<VotingContextType["eventStatus"]>("not_started");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    voteLimit: 3,
    eventName: "Cargando...",
    eventCode: "",
    allowComments: true,
  });
  const [loading, setLoading] = useState(true);

  // Función principal para cargar datos (puede ser llamada desde useEffect o manualmente)
  const loadEventData = useCallback(async () => {
    
    try {
      setLoading(true);
      
      const eventoId = localStorage.getItem("eventoId");
      const eventName = localStorage.getItem("eventoNombre");
      const eventCode = localStorage.getItem("eventoCodigo") || "EVENTO";

      // Configurar evento desde localStorage
      setEventConfig({
        voteLimit: 3,
        eventName: eventName || "Evento sin nombre",
        eventCode: eventCode,
        allowComments: true,
      });

      // Obtener categorías del evento
      if (eventoId) {
        
        const categorias = await categoriasApi.getByEvento(parseInt(eventoId));
        
        // Mapear las categorías al formato que espera el frontend
        const formattedCategories: Category[] = categorias.map((cat: any) => ({
          id: cat.id,
          name: cat.nombre,
          status: cat.estado === "Activa" ? "active" : 
                  cat.estado === "Pendiente" ? "pending" : 
                  cat.estado === "Finalizada" ? "closed" : 
                  cat.estado === "Pausada" ? "paused" : "pending",
          startTime: cat.fechaInicio ? new Date(cat.fechaInicio) : undefined,
          endTime: cat.fechaFin ? new Date(cat.fechaFin) : undefined
        }));
        
        setCategories(formattedCategories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar notificaciones desde localStorage
  const loadNotifications = useCallback(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      const withDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(withDates);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadEventData();
    loadNotifications();
  }, [loadEventData, loadNotifications]);

  // Escuchar cambios en localStorage (para cuando se actualiza desde otra pestaña)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "eventoId" || e.key === "eventoNombre" || e.key === "eventoCodigo") {
        loadEventData();
      }
      if (e.key === "notifications") {
        loadNotifications();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadEventData, loadNotifications]);

  const addNotification = useCallback((state: string, categoryName?: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      state: state,
      categoryName,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    showNotification({
      state,
      categoryName,
      timestamp: new Date(),
    });

    const stored = localStorage.getItem("notifications");
    const notifications = stored ? JSON.parse(stored) : [];
    notifications.unshift(newNotification);
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, []);

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      const updated = parsed.map((n: any) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem("notifications", JSON.stringify(updated));
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    const stored = localStorage.getItem("notifications");
    if (stored) {
      const parsed = JSON.parse(stored);
      const updated = parsed.map((n: any) => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(updated));
    }
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.setItem("notifications", JSON.stringify([]));
  }, []);

  const updateEventConfig = useCallback((config: Partial<EventConfig>) => {
    setEventConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const startCategory = useCallback((categoryId: string | number) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const updatedCat: Category = { ...cat, status: "active", startTime: new Date() };
          setCurrentCategory(updatedCat);
          
          addNotification("category_started", cat.name);
          addNotification("voting_started", cat.name);
          
          setEventStatus("in_progress");
          return updatedCat;
        }
        return cat;
      })
    );
  }, [addNotification]);

  const closeCategory = useCallback((categoryId: string | number) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const updatedCat: Category = { ...cat, status: "closed", endTime: new Date() };
          
          addNotification("category_closed", cat.name);
          addNotification("voting_closed", cat.name);
          
          setCurrentCategory(null);
          return updatedCat;
        }
        return cat;
      })
    );
  }, [addNotification]);

  const pauseVoting = useCallback(() => {
    if (currentCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === currentCategory.id ? { ...cat, status: "paused" as const } : cat
        )
      );
      
      setEventStatus("paused");
      addNotification("voting_paused", currentCategory.name);
    }
  }, [currentCategory, addNotification]);

  const resumeVoting = useCallback(() => {
    if (currentCategory) {
      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === currentCategory.id ? { ...cat, status: "active" as const } : cat
        )
      );
      
      setEventStatus("in_progress");
      addNotification("voting_resumed", currentCategory.name);
    }
  }, [currentCategory, addNotification]);

  const closeEvent = useCallback(() => {
    setEventStatus("closed");
    setCurrentCategory(null);
    addNotification("voting_closed");
  }, [addNotification]);

  const showResults = useCallback(() => {
    setEventStatus("results");
    addNotification("results_available");
  }, [addNotification]);

  return (
    <VotingContext.Provider
      value={{
        categories,
        currentCategory,
        eventStatus,
        notifications,
        eventConfig,
        loading,
        startCategory,
        closeCategory,
        pauseVoting,
        resumeVoting,
        closeEvent,
        showResults,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateEventConfig,
        addNotification,
        reloadContext: loadEventData,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
}