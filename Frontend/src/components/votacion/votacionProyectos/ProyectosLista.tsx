import React from 'react';

interface ProyectoItem {
    id: number | string;
    nombre: string;
    descripcion?: string;
    desc?: string;
    estado?: string;
}

interface ProyectosListaProps {
    proyectos?: ProyectoItem[];
    seleccionado: any;
    alSeleccionar: (p: ProyectoItem) => void;
}

const ProyectosLista = ({ proyectos = [], seleccionado, alSeleccionar }: ProyectosListaProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {proyectos.map((p) => (
        <div
          key={p.id}
          onClick={() => p.estado !== 'votado' && alSeleccionar(p)}
          className={`cursor-pointer rounded-xl overflow-hidden border transition-all ${seleccionado?.id === p.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}
        >
          <div className="p-5">
            <h3 className="text-xl font-bold mb-3">{p.nombre}</h3>
            <p className="text-gray-500 text-sm h-12 line-clamp-2">{p.descripcion || p.desc}</p>
          </div>

          <div className={`p-4 border-t flex justify-between items-center ${p.estado === 'votado' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
            <span className="text-sm font-medium">
              {p.estado === 'votado' ? 'Votado anteriormente' : (seleccionado?.id === p.id ? 'Seleccionado' : 'No seleccionado')}
            </span>
            {p.estado === 'votado' && <span className="bg-white rounded-full p-1 shadow-sm">✕</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProyectosLista;