import React from 'react';

const OpcionesSeleccionado = ({ seleccionado, comentario, setComentario, comentariosObligatorios }) => {
  return (
    <div className="border-t pt-8">
      <h3 className="text-2xl font-bold mb-6">
        Tu voto: <span className={seleccionado ? "text-blue-600" : "text-gray-900"}>{seleccionado ? seleccionado.nombre : "Ninguno"}</span>
      </h3>

      <label className="block text-gray-700 font-bold mb-2">
        Añadir comentario {comentariosObligatorios && <span className="text-red-500">*</span>}
      </label>
      <textarea
        placeholder={comentariosObligatorios ? "Escribe tu comentario aquí (Obligatorio)..." : "Escribe tu comentario aquí..."}
        required={comentariosObligatorios}
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
      ></textarea>
    </div>
  );
};

export default OpcionesSeleccionado;
