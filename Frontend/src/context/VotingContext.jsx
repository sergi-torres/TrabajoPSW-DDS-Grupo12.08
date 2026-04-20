import { createContext, useContext, useState, useCallback } from "react";
import { showNotification } from "../components/Notifications/NotificationSystem";

const VotingContext = createContext(undefined);

// Mock categories
const initialCategories = [
  { id: "1", name: "Innovación", status: "pending" },
  { id: "2", name: "Diseño", status: "pending" },
  { id: "3", name: "Funcionalidad", status: "pending" },
  { id: "4", name: "Presentación", status: "pending" },
];

// Configuración inicial del evento
const initialEventConfig = {
  voteLimit: 3, // Por defecto 3 votos
  eventName: "Hackathon Tech 2026",
  eventCode: "HACK26",
  allowComments: true,
};

export function VotingProvider({ children }) {
  const [categories, setCategories] = useState(initialCategories);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [eventStatus, setEventStatus] = useState("not_started");
  const [notifications, setNotifications] = useState([]);
  const [eventConfig, setEventConfig] = useState(initialEventConfig);

  const addNotification = useCallback((state, categoryName) => {
    const newNotification = {
      id: Date.now().toString(),
      state: state,
      categoryName,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications((prev) => [newNotification, ...prev]);
    
    // También mostrar el toast
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
          
          // Notificaciones
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
          
          // Notificación
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