import React from 'react';
import { Clock, ArrowLeft } from 'lucide-react'; // O usa iconos de tu preferencia

const VotacionNoIniciada = ({ fechaInicio = "2026-04-03T14:00" }) => {
  // Formatear la fecha para que se vea bonita
  const fechaFormateada = new Date(fechaInicio).toLocaleString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10">
          
          {/* Icono de espera */}
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Clock size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">La votación aún no ha comenzado</h1>
          <p className="text-gray-500 mb-8 px-4">
            Estamos preparando todo. Podrás participar a partir del:
          </p>

          {/* Caja de fecha */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
            <p className="text-blue-700 font-bold capitalize">
              {fechaFormateada}
            </p>
          </div>

          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 w-full py-4 text-gray-500 font-bold hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={18} /> Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotacionNoIniciada;