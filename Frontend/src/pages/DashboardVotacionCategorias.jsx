import React, { useState, useEffect, useContext } from 'react';
import { ArrowLeft, Target, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatsBar from '../components/votacion/votacionCategorias/StatsBar';
import CategoriaCard from '../components/votacion/votacionCategorias/CategoriaCard';
import DashboardVotacionProyectos from './DashboardVotacionProyectos';
import { useVotacionDashboard } from '../hooks/VotacionHooks/useVotacionDashboard';
import { EventContext } from '../context/EventContext';
import { EventSidebar } from '../components/layout/EventSidebar';

const DashboardVotacionCategorias = () => {
  const navigate = useNavigate();
  const { userRole, userColor } = useContext(EventContext);
  const { datos, cargando, cargarDashboard } = useVotacionDashboard();
  const [vistaActual, setVistaActual] = useState('categorias');
  const [categoriaElegida, setCategoriaElegida] = useState(null);

  useEffect(() => {
    if (vistaActual === 'categorias') {
      cargarDashboard();
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
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar />

      <div className="pb-[88px] lg:pb-0">
        {/* HEADER - Dynamic Style - Full Width */}
        <header className="text-white p-6 lg:p-10 lg:pl-80" style={{ backgroundColor: userColor }}>
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => navigate('/eventos')}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
              Volver a eventos
            </button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-3">
                  Panel de Evaluación
                </h1>
                <p className="text-lg font-medium opacity-90">
                  Selecciona una categoría para comenzar a evaluar los proyectos. 
                  Tus votos son limitados por categoría.
                </p>
              </div>
              {datos && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <p className="text-xs uppercase tracking-wider font-bold mb-1 opacity-80">Estado de Sesión</p>
                  <p className="text-xl font-heading font-bold">{userRole}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 lg:p-10 lg:pl-80 -mt-8 space-y-8">
          {datos && (
            <>
              {/* Stats Section in a Card */}
              <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-6 h-6" style={{ color: userColor }} />
                  <h2 className="text-xl font-heading font-bold text-gray-900">Resumen de Votación</h2>
                </div>
                <StatsBar config={datos} />
              </section>

              {/* Categories Grid */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Award className="w-6 h-6" style={{ color: userColor }} />
                  <h2 className="text-xl font-heading font-bold text-gray-900">Categorías Disponibles</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {datos.categorias.map(cat => (
                    <div key={cat.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 p-1">
                      <CategoriaCard
                        categoria={cat}
                        alVotar={() => {
                          setCategoriaElegida(cat);
                          setVistaActual('proyectos');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardVotacionCategorias;
