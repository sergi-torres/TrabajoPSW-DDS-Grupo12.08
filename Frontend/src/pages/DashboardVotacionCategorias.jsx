import React, { useState, useEffect } from 'react';
import StatsBar from '../components/votacion/votacionCategorias/StatsBar';
import CategoriaCard from '../components/votacion/votacionCategorias/CategoriaCard';
import DashboardVotacionProyectos from './DashboardVotacionProyectos';
import { useVotacionDashboard } from '../hooks/VotacionHooks/useVotacionDashboard';

const DashboardVotacionCategorias = () => {
  const { datos, cargando, cargarDashboard, env } = useVotacionDashboard();
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
    <div className="p-12 bg-[#FDFDFD] min-h-screen font-sans">
      <header className="mb-12">
        <h1 className="text-5xl font-black text-gray-900 tracking-tight">Votación de proyectos</h1>
        <p className="text-gray-500 mt-4 text-lg max-w-3xl leading-relaxed font-medium">
          Selecciona tus proyectos favoritos en cada categoría. Dispones de votos limitados por categoría,
          así que elige sabiamente. El tiempo de votación es limitado.
        </p>
      </header>

      {datos && (
        <>
          <StatsBar config={datos} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {datos.categorias.map(cat => (
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
        </>
      )}
    </div>
  );
};

export default DashboardVotacionCategorias;
