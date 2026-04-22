import React from 'react';
import { CheckCircle2, Trophy } from 'lucide-react';

const VotacionFinalizada = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-10">
          
          {/* Icono de finalizado */}
          <div className="w-20 h-20 bg-green-50 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-3">Votación Finalizada</h1>
          <p className="text-gray-500 mb-8">
            El periodo de votación para esta categoría ha terminado. Gracias por hacer que tu voz cuente.
          </p>

          {/* Banner de Resultados (Opcional) */}
          <div className="bg-green-50 rounded-2xl p-4 mb-8 flex items-center justify-center gap-3 border border-green-100">
            <Trophy size={20} className="text-green-700" />
            <p className="text-green-700 font-bold text-sm">
              Los resultados se publicarán pronto
            </p>
          </div>

          <button 
            onClick={() => window.location.href = '/'} // O tu ruta de inicio
            className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95"
          >
            Ir a la página principal
          </button>
        </div>
      </div>
    </div>
  );
};

export default VotacionFinalizada;