import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

interface CategoriaData {
    titulo: string;
    votosRestantes: number;
    estado: 'activa' | 'completado' | 'pendiente' | 'finalizada' | 'pausada';
}

interface CategoriaCardProps {
    categoria: CategoriaData;
    alVotar?: () => void;
}

const CategoriaCard = ({ categoria, alVotar }: CategoriaCardProps) => {
  const authContext = useContext(AuthContext);
  if (!authContext) return null;
  const { isPublic } = authContext;
  // Extraemos los datos del objeto que viene de la API
  const { titulo, votosRestantes, estado } = categoria;
  
  const configEstado = {
    activa: {
      colorBg: 'bg-blue-50',
      colorText: 'text-blue-500',
      label: 'Pendiente de voto',
      btnText: 'Votar ahora',
      btnDisabled: false,
      btnClass: 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100',
      icon: <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
    },
    completado: {
      colorBg: 'bg-green-50',
      colorText: 'text-green-500',
      label: 'Voto registrado',
      btnText: 'Finalizado',
      btnDisabled: true,
      btnClass: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    pendiente: {
      colorBg: 'bg-gray-50',
      colorText: 'text-gray-400',
      label: 'Aún no disponible',
      btnText: 'Próximamente',
      btnDisabled: true,
      btnClass: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3" />
        </svg>
      )
    },
    finalizada: {
      colorBg: 'bg-red-50',
      colorText: 'text-red-500',
      label: 'Votación cerrada',
      btnText: 'Cerrada',
      btnDisabled: true,
      btnClass: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      )
    },
    pausada: {
      colorBg: 'bg-amber-50',
      colorText: 'text-amber-500',
      label: 'Votación pausada',
      btnText: 'Pausada',
      btnDisabled: true,
      btnClass: 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const actualConfig = configEstado[estado] || configEstado.pendiente;
  const labelColor = estado === "activa" ? (isPublic ? 'text-emerald-500' : 'text-orange-400') : actualConfig.colorText;

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all min-h-[320px] h-full">
      
      {/* Indicador de estado */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${actualConfig.colorBg} ${actualConfig.colorText}`}>
        {actualConfig.icon}
      </div>
      
      {/* Contenedor del título */}
      <div className="h-[60px] flex items-center justify-center mb-2 w-full">
        <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2">
          {titulo}
        </h3>
      </div>

      {/* Frase de estado */}
      <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${labelColor}`}>
        {actualConfig.label}
      </p>

      {/* Espaciador para empujar el contenido inferior hacia abajo y alinearlo */}
      <div className="flex-grow" />

      {/* Votos restantes en esta categoría */}
      <div className="bg-gray-50 px-5 py-2 rounded-2xl mb-6 w-full max-w-[240px]">
        <p className="text-gray-500 text-sm font-medium">
          Te quedan <span className="text-gray-900 font-black">{votosRestantes}</span> votos
        </p>
      </div>
      
      {/* Botón principal */}
      <button 
        onClick={alVotar}
        disabled={actualConfig.btnDisabled}
        className={`px-4 py-3 rounded-2xl font-bold transition-all shadow-lg w-full max-w-[240px] text-sm md:text-base ${actualConfig.btnClass}`}
      >
        {actualConfig.btnText}
      </button>
    </div>
  );
};

export default CategoriaCard;