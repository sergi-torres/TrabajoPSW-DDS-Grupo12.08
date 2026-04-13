import React, { useState } from 'react';
import ProyectosLista from '../components/votacion/votacionProyectos/ProyectosLista';
import OpcionesSeleccionado from '../components/votacion/votacionProyectos/OpcionesSeleccionado';
import { useEnviarVoto } from '../hooks/VotacionHooks/useEnvioVoto';

const DashboardVotacionProyectos = ({ categoria, alVolver }) => {
  const { enviarVoto, cargando, error } = useEnviarVoto();
  
  // Estado local ascendido
  const [seleccionado, setSeleccionado] = useState(null);
  const [comentario, setComentario] = useState("");

  const handleConfirmar = async () => {
    if (!seleccionado) return;

    const eventoId = parseInt(localStorage.getItem('eventoId'));
    const userIdRaw = localStorage.getItem('userId');
    const idUsuario = userIdRaw ? parseInt(userIdRaw) : null;
    const sessionId = localStorage.getItem('votacionSessionId');

    const votoDto = {
      eventoId: eventoId,
      categoriaId: categoria.id,
      proyectoId: seleccionado.id,
      comentario: comentario,
      idUsuario: Number.isNaN(idUsuario) ? null : idUsuario,
      sessionId: sessionId || null
    };

    const exito = await enviarVoto(votoDto);
    if (exito) {
      alVolver(); // Solo volvemos atrás si el voto resultó ser exitoso.
    }
  };

  // Extraemos los proyectos que vienen nativos en la categoria 
  // O en caso remoto de ser null, mapeamos array vacio preventivo.
  const proyectos = categoria?.proyectos || [];

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans bg-white min-h-screen">
      <header className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900">
            Vota un proyecto en "{categoria?.titulo || 'Categoría'}"
        </h2>
        <p className="text-gray-500 mt-2">
            Selecciona el proyecto que más te guste de la lista. Tu opinión es importante para nosotros.
        </p>
      </header>

      {/* Componente tonto 1: Lista */}
      <ProyectosLista 
        proyectos={proyectos} 
        seleccionado={seleccionado} 
        alSeleccionar={setSeleccionado} 
      />

      {/* Componente tonto 2: Comentarios */}
      <OpcionesSeleccionado
        seleccionado={seleccionado}
        comentario={comentario}
        setComentario={setComentario}
      />

      {/* Botones Globales (Movidos aquí) */}
      <div className="flex justify-end gap-4 mt-8 pb-10">
        <button
          onClick={alVolver}
          disabled={cargando}
          className="px-10 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Atrás
        </button>
        <button
          onClick={handleConfirmar}
          disabled={!seleccionado || cargando}
          className={`px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
            seleccionado && !cargando
              ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-100 cursor-pointer'
              : 'bg-blue-300 cursor-not-allowed shadow-none'
          }`}
        >
          {cargando ? 'Enviando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
};

export default DashboardVotacionProyectos;
