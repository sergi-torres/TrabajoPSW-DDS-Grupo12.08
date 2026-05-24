import React, { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Target, Award, LogOut } from 'lucide-react';
import SimpleSearchBar from '../components/layout/SimpleSearchBar';

import { useNavigate } from 'react-router-dom';
import StatsBar from '../components/votacion/votacionCategorias/StatsBar';
import CategoriaCard from '../components/votacion/votacionCategorias/CategoriaCard';
import DashboardVotacionProyectos from './DashboardVotacionProyectos';
import { useVotacionDashboard } from '../hooks/VotacionHooks/useVotacionDashboard';
import { EventContext } from '../context/EventContext';
import { AuthContext } from '../context/AuthContext';
import { EventSidebar } from '../components/layout/EventSidebar';
import { LogoutConfirmModal } from '../components/layout/LogoutConfirmModal';
import { cn } from '../components/ui/utils';

const DashboardVotacionCategorias = () => {
  const navigate = useNavigate();
  const { logout, isPublic, isAuthenticated } = useContext(AuthContext)!;
  const { userRole, userColor, isCollapsed, clearEventContext, setEventContext } = useContext(EventContext)!;
  const { datos, cargando, cargarDashboard } = useVotacionDashboard();
  const [vistaActual, setVistaActual] = useState('categorias');
  const [categoriaElegida, setCategoriaElegida] = useState<any>(null);
  const [busquedaCategorias, setBusquedaCategorias] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determinar si es público de forma inmediata para el layout
  // PRIORIDAD: Si no estoy autenticado pero tengo sesión de PIN, soy PÚBLICO.
  const effectivelyPublic = (!isAuthenticated && isPublic) || userRole === "Público";
  const themeColor = effectivelyPublic ? "#059669" : (userColor || "#2563eb");

  // Inicializar contexto si es público y no está seteado
  useEffect(() => {
    if (effectivelyPublic && (!userRole || userRole !== "Público")) {
        setEventContext({
            userRole: "Público",
            userColor: "#059669"
        });
    }
  }, [effectivelyPublic, userRole, setEventContext]);

  useEffect(() => {
    if (vistaActual === 'categorias') {
      cargarDashboard();
      
      // Sincronización automática cada 10 segundos
      const interval = setInterval(() => {
        cargarDashboard();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [vistaActual, cargarDashboard]);

  if (cargando && !datos) {
    return <div className="p-20 text-center font-bold text-gray-400">Cargando panel...</div>;
  }

  if (vistaActual === 'proyectos') {
    return (
      <DashboardVotacionProyectos
        categoria={categoriaElegida}
        alVolver={() => setVistaActual('categorias')}
        comentariosObligatorios={(datos as any)?.comentariosObligatorios ?? false}
      />
    );
  }

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      logout();
      clearEventContext();
      navigate('/login');
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      {!effectivelyPublic && <EventSidebar />}

      <div className="pb-[88px] lg:pb-0">
        {/* HEADER - Dynamic Style - Full Width */}
        <header 
          className={cn(
            "text-white p-6 lg:p-10 transition-all duration-300",
            effectivelyPublic ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
          )}
          style={{ backgroundColor: themeColor }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              {!effectivelyPublic ? (
                <button
                  onClick={() => navigate('/eventos')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  Volver a eventos
                </button>
              ) : (
                <div /> // Spacer
              )}

              {effectivelyPublic && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Salir
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-3">
                  {effectivelyPublic ? `Votación: ${localStorage.getItem("eventoNombre") || "Evento"}` : "Panel de Evaluación"}
                </h1>
                <p className="text-lg font-medium opacity-90">
                  {effectivelyPublic 
                    ? "Bienvenido. Selecciona el proyecto que más te guste para emitir tu voto."
                    : "Selecciona una categoría para comenzar a evaluar los proyectos. Tus votos son limitados por categoría."
                  }
                </p>
              </div>
              {datos && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">Estado de Sesión</p>
                  <p className="text-xl font-heading font-bold">{effectivelyPublic ? "Público" : userRole}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className={cn(
          "max-w-7xl mx-auto p-6 lg:p-10 -mt-8 space-y-8 transition-all duration-300",
          effectivelyPublic ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')
        )}>
          {datos && (
            <>
              {/* Stats Section in a Card */}
              <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6" style={{ color: themeColor }} />
                  <h2 className="text-xl font-heading font-bold text-gray-900">Resumen de Votación</h2>
                </div>
                <StatsBar config={datos as any} themeColor={themeColor} />
              </section>

              {/* Categories Grid */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6" style={{ color: themeColor }} />
                  <h2 className="text-xl font-heading font-bold text-gray-900">Categorías Disponibles</h2>
                </div>
                <div className="mb-6">
                  <SimpleSearchBar
                    value={busquedaCategorias}
                    onChange={setBusquedaCategorias}
                    placeholder="Busca por nombre de categoría"
                    className="relative max-w-xl"
                    inputClassName="w-full bg-muted hover:bg-accent focus:bg-card border border-transparent focus:border-[var(--color-org)]/30 rounded-full h-11 pl-11 pr-4 outline-none transition-all text-sm font-body text-foreground placeholder:text-muted-foreground focus:shadow-[0_0_0_4px_rgba(59,130,246,0.05)]"
                  />
                </div>


              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {((datos as any).categorias || [])
                    .filter((cat: any) => {
                      const textoCategoria = (cat.titulo || cat.nombre || cat.Titulo || "").toString().toLowerCase();
                      return textoCategoria.includes(busquedaCategorias.toLowerCase().trim());
                    })
                    .map((cat: any) => (
                      <CategoriaCard
                        key={cat.id}
                        categoria={cat}
                        alVotar={() => {
                          setCategoriaElegida(cat);
                          setVistaActual('proyectos');
                        }}
                      />
                    ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DashboardVotacionCategorias;
