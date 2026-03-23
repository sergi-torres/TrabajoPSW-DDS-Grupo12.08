import React, { useState } from 'react';
import StatsBar from '../components/votacion/votacionCategorias/StatsBar';
import CategoriaCard from '../components/votacion/votacionCategorias/CategoriaCard';
import ProyectosLista from '../components/votacion/votacionProyectos/ProyectosLista';

const CONFIG_NEGOCIO = {
  usuario: "Brad",
  votosGlobalesRealizados: 8,
  votosGlobalesMaximos: 20,
  proyectosActivos: 24,
  tiempoRestante: "45:00",
  categorias: [
    { id: 1, titulo: "Innovación Tecnológica", votosRestantes: 3, estado: "pendiente" },
    { id: 2, titulo: "Impacto Social", votosRestantes: 0, estado: "completado" },
    { id: 3, titulo: "Sostenibilidad", votosRestantes: 5, estado: "pendiente" },
    { id: 4, titulo: "Diseño Creativo", votosRestantes: 2, estado: "pendiente" },
  ]
};

const PanelVotacion = () => {
  const [vistaActual, setVistaActual] = useState('categorias');
  const [categoriaElegida, setCategoriaElegida] = useState(null);

  if (vistaActual === 'proyectos') {
    return <ProyectosLista categoria={categoriaElegida} alVolver={() => setVistaActual('categorias')} />;
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
      
      {/* 🚀 AHORA SÍ ESTAMOS USANDO EL COMPONENTE */}
      <StatsBar config={CONFIG_NEGOCIO} />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {CONFIG_NEGOCIO.categorias.map(cat => (
          <CategoriaCard 
            key={cat.id} 
            categoria={cat} 
            alVotar={() => { setCategoriaElegida(cat); setVistaActual('proyectos'); }} 
          />
        ))}
      </div>
    </div>
  );
};

export default PanelVotacion;