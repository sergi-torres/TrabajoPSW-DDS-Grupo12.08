import React from 'react';

interface StatsBarConfig {
    categorias: any[];
    proyectosActivos: number;
    votosGlobalesRealizados: number;
    votosGlobalesMaximos: number;
    tiempoRestante: string;
}

interface StatsBarProps {
    config: StatsBarConfig;
    themeColor?: string;
}

const StatsBar = ({ config, themeColor = "#2563eb" }: StatsBarProps) => {
  // Extraemos los datos del objeto que viene de la lógica de negocio
  const { categorias, proyectosActivos, votosGlobalesRealizados, votosGlobalesMaximos, tiempoRestante } = config;

  const stats = [
    { etiqueta: "Total de categorías", valor: categorias.length },
    { etiqueta: "Proyectos activos", valor: proyectosActivos },
    { etiqueta: "Votos realizados", valor: `${votosGlobalesRealizados}/${votosGlobalesMaximos}` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((s, i) => (
        <div key={i} className="bg-white p-7 rounded-[24px] border border-gray-100 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow">
          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">
            {s.etiqueta}
          </p>
          <p className="text-3xl font-black" style={{ color: themeColor }}>
            {s.valor}
          </p>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;