import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { showNotification } from "../components/Notifications/NotificationSystem";
import { categoriasApi } from "../api/categoriasApi";

const VotingContext = createContext(undefined);

export function VotingProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [eventStatus, setEventStatus] = useState("not_started");
  const [notifications, setNotifications] = useState([]);
  const [eventConfig, setEventConfig] = useState({
    voteLimit: 3,
    eventName: "Cargando...",
    eventCode: "",
    allowComments: true,
  });
  const [loading, setLoading] = useState(true);

  // Cargar categorías y configuración del evento al iniciar
  useEffect(() => {
    const loadEventData = async () => {
      try {
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
          const formattedCategories = categorias.map(cat => ({
            id: cat.id?.toString() || cat.id,
            name: cat.nombre || cat.name,
            status: cat.estado === "activa" ? "active" : "pending"
          }));
          
          setCategories(formattedCategories);
        } else {
          console.warn("No hay eventoId en localStorage");
          setCategories([]);
        }
      } catch (error) {
        console.error("Error cargando datos del evento:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadEventData();
  }, []);

  const addNotification = useCallback((state, categoryName) => {
    const newNotification = {
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
  }, []);

  const markNotificationAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateEventConfig = useCallback((config) => {
    setEventConfig((prev) => ({ ...prev, ...config }));
  }, []);

  const startCategory = useCallback((categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const updatedCat = { ...cat, status: "active", startTime: new Date() };
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

  const closeCategory = useCallback((categoryId) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          const updatedCat = { ...cat, status: "closed", endTime: new Date() };
          
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
          cat.id === currentCategory.id ? { ...cat, status: "paused" } : cat
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
          cat.id === currentCategory.id ? { ...cat, status: "active" } : cat
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando evento...</p>
        </div>
      </div>
    );
  }

  return (
    <VotingContext.Provider
      value={{
        categories,
        currentCategory,
        eventStatus,
        notifications,
        eventConfig,
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