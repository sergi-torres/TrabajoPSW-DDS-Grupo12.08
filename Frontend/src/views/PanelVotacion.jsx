import React, { useState, useEffect, useCallback } from 'react';
import StatsBar from '../components/votacion/votacionCategorias/StatsBar';
import CategoriaCard from '../components/votacion/votacionCategorias/CategoriaCard';
import ProyectosLista from '../components/votacion/votacionProyectos/ProyectosLista';

const PanelVotacion = () => {
  // 1. Estado para almacenar los datos que vienen del Backend
  const [datos, setDatos] = useState(null);
  const [vistaActual, setVistaActual] = useState('categorias');
  const [categoriaElegida, setCategoriaElegida] = useState(null);
  const [cargando, setCargando] = useState(true);

  // 2. Función para obtener los datos del Backend
  const cargarDashboard = useCallback(async () => {
    try {
      // Ajusta la URL al puerto que use tu Visual Studio (ej: 7123 o 5000)
      const response = await fetch('http://localhost:5245/api/votacion/dashboard');
      if (response.ok) {
        const result = await response.json();
        setDatos(result);
      }
    } catch (error) {
      console.error("Error cargando el dashboard:", error);
    } finally {
      setCargando(false);
    }
  }, []);

  // 3. Efecto que recarga los datos al iniciar y cada vez que volvemos a esta pantalla
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
      <ProyectosLista 
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
      
      {/* 4. Ahora pasamos los datos del estado 'datos' en lugar del objeto fijo */}
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

export default PanelVotacion;