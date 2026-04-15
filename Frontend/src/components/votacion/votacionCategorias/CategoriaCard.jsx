import React, { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const CategoriaCard = ({ categoria, alVotar }) => {
  const { isPublic } = useContext(AuthContext);
  // Extraemos los datos del objeto que viene de CONFIG_NEGOCIO
  const { titulo, votosRestantes, estado } = categoria;
  const esCompletado = estado === "completado";

  return (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-all min-h-[320px]">
      
      {/* Indicador de estado (Círculo con check o punto) */}
      <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${  // Cambié mb-6 a mb-4
        esCompletado ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
      }`}>
        {esCompletado ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
      
      {/* Contenedor del título con altura mínima para consistencia */}
      <div className="min-h-[60px] flex items-center justify-center mb-2">  {/* Altura mínima para el título */}
        <h3 className="text-xl font-bold text-gray-900 leading-tight">
          {titulo}
        </h3>
      </div>

      {/* Frase de estado que pediste */}
      <p className={`text-xs font-bold uppercase tracking-wider mb-4 ${
        esCompletado ? 'text-green-500' : (isPublic ? 'text-emerald-500' : 'text-orange-400')
      }`}>
        {esCompletado ? 'Voto registrado' : 'Pendiente de voto'}
      </p>

      {/* Votos restantes en esta categoría */}
      <div className="bg-gray-50 px-5 py-2 rounded-2xl mb-6">  {/* Cambié mb-8 a mb-6 */}
        <p className="text-gray-500 text-sm font-medium">
          Te quedan <span className="text-gray-900 font-black">{votosRestantes}</span> votos
        </p>
      </div>
      
      {/* Botón más corto (px-10 en lugar de w-full) */}
      <button 
        onClick={alVotar}
        disabled={esCompletado}
        className={`px-10 py-3 rounded-2xl font-bold transition-all shadow-lg ${
          esCompletado 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
        }`}
      >
        {esCompletado ? 'Finalizado' : 'Votar ahora'}
      </button>
    </div>
  );
};

export default CategoriaCard;