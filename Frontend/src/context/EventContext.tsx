import React, { createContext, useState, ReactNode } from "react";

export interface EventContextType {
  eventoId: number | null;
  userRole: string | null;
  userColor: string | null;
  isCollapsed: boolean;
  setEventContext: (data: Partial<EventContextType>) => void;
  clearEventContext: () => void;
  toggleSidebar: () => void;
}

export const EventContext = createContext<EventContextType | null>(null);

export const EventProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState({
    eventoId: localStorage.getItem("eventoId") ? Number(localStorage.getItem("eventoId")) : null,
    userRole: localStorage.getItem("userRole"),
    userColor: localStorage.getItem("userColor") || "#2563eb",
    isCollapsed: localStorage.getItem("sidebarCollapsed") === "true",
  });

  const setEventContext = (data: Partial<EventContextType>) => {
    setState((prev) => {
      const newState = { ...prev, ...data } as typeof prev;
      if (data.eventoId !== undefined) localStorage.setItem("eventoId", data.eventoId?.toString() || "");
      if (data.userRole !== undefined) localStorage.setItem("userRole", data.userRole || "");
      if (data.userColor !== undefined) localStorage.setItem("userColor", data.userColor || "");
      return newState;
    });
  };

  const clearEventContext = () => {
    setState({
      eventoId: null,
      userRole: null,
      userColor: "#2563eb",
      isCollapsed: false,
    });
    localStorage.removeItem("eventoId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userColor");
  };

  const toggleSidebar = () => {
    setState((prev) => {
      const isCollapsed = !prev.isCollapsed;
      localStorage.setItem("sidebarCollapsed", String(isCollapsed));
      return { ...prev, isCollapsed };
    });
  };

  return (
    <EventContext.Provider
      value={{
        ...state,
        setEventContext,
        clearEventContext,
        toggleSidebar,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};
