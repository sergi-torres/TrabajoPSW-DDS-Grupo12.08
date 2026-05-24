import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventSidebar } from "../components/layout/EventSidebar";
import { EventContext } from "../context/EventContext";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, LogOut, Trash2 } from "lucide-react";
import { getDashboard } from "../api/orgDashboardApi";
import { eliminarEvento } from "../api/eventosApi";
import ConfigTiempoVotacionBar from '../components/configuraciones/ConfigTiempoVotacionBar';
import ConfigLimiteVotos from '../components/configuraciones/ConfigLimiteVotos';
import ConfigHelpPanel from '../components/ui/ConfigHelpPanel';
import { toast } from "sonner";

const Configuraciones: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { userRole, userColor, isCollapsed, clearEventContext } = useContext(EventContext) as any;
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isPublicRole = userRole === "Público";
  const isOrganizer = userRole === "Organizador";

  const fetchEventInfo = useCallback(async () => {
    if (!eventoId || eventoId === "undefined") return;
    try {
      const data: any = await getDashboard(eventoId as any);
      setEventInfo(data.liveInfo);
    } catch (err) {
      console.error("Error cargando info del evento:", err);
    }
  }, [eventoId]);

  useEffect(() => {
    if (eventoId) {
      fetchEventInfo();
    }
  }, [eventoId, fetchEventInfo]);

  const handleLogout = () => {
    logout();
    clearEventContext();
    navigate('/login');
  };

  const handleEliminarEvento = async () => {
    if (!eventoId) return;
    const token = localStorage.getItem("token") || "";
    setDeleting(true);
    try {
      await eliminarEvento(parseInt(eventoId), token);
      toast.success("Evento eliminado correctamente");
      clearEventContext();
      navigate('/eventos');
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar el evento");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar />

      <div className="pb-[88px] lg:pb-12">
        <header
          className={`bg-blue-600 text-white p-6 lg:p-10 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}
          style={{ backgroundColor: userColor }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              {!isPublicRole ? (
                <button
                  onClick={() => navigate('/eventos')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  Volver a eventos
                </button>
              ) : (
                <div />
              )}

              {isPublicRole && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Salir
                </button>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
              Configuraciones
            </h1>
            <p className="text-blue-100 text-lg opacity-90">Configuración de Tiempos de Votación</p>
          </div>
        </header>

        <main className={`max-w-7xl mx-auto p-6 lg:p-10 space-y-12 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>
          {eventoId && (
            <>
              <ConfigTiempoVotacionBar eventoId={eventoId} />
              <ConfigLimiteVotos eventoId={eventoId} />
            </>
          )}

          {isOrganizer && (
            <section className="border border-red-200 rounded-2xl p-6 bg-red-50">
              <h2 className="text-lg font-heading font-bold text-red-700 mb-1">Zona de peligro</h2>
              <p className="text-sm text-red-500 mb-4">
                Eliminar el evento borrará todos sus datos de forma permanente. Esta acción no se puede deshacer.
              </p>

              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-red-300 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar evento
                </button>
              ) : (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <p className="text-sm font-semibold text-red-700">¿Seguro que quieres eliminar este evento?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      disabled={deleting}
                      className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleEliminarEvento}
                      disabled={deleting}
                      className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      {deleting ? "Eliminando…" : "Sí, eliminar"}
                    </button>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
      </div>

      {/* Floating config help panel */}
      <ConfigHelpPanel />
    </div>
  );
};

export default Configuraciones;
