import React, { useState } from 'react';

const ProyectosLista = ({ categoria, alVolver }) => {
  const [seleccionado, setSeleccionado] = useState(null);

  const proyectos = [
    { id: 1, nombre: "InnovaTech", desc: "Plataforma de innovación tecnológica para empresas", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400", estado: "disponible" },
    { id: 2, nombre: "Energía Solar+", desc: "Solución de energía sostenible para comunidades", img: "https://images.unsplash.com/photo-1509391366360-fe5bb584852a?auto=format&fit=crop&w=400", estado: "votado" },
    { id: 3, nombre: "AppMóvil Pro", desc: "Desarrollo de aplicaciones móviles de última generación", img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400", estado: "disponible" },
    { id: 4, nombre: "IA Salud", desc: "Inteligencia artificial aplicada al sector salud", img: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400", estado: "disponible" },
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 font-sans bg-white min-h-screen">
      <header className="mb-10">
        <h2 className="text-4xl font-bold text-gray-900">Vota un proyecto en "{categoria?.titulo || 'Categoría'}"</h2>
        <p className="text-gray-500 mt-2">Selecciona el proyecto que más te guste de la lista. Tu opinión es importante para nosotros. Solo puedes votar por un proyecto a la vez.</p>
      </header>

      {/* Grid de Proyectos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {proyectos.map((p) => (
          <div 
            key={p.id} 
            onClick={() => p.estado !== 'votado' && setSeleccionado(p)}
            className={`cursor-pointer rounded-xl overflow-hidden border transition-all ${seleccionado?.id === p.id ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-100'}`}
          >
            <img src={p.img} alt={p.nombre} className="w-full h-48 object-cover" />
            <div className="p-5">
              <h3 className="text-xl font-bold mb-3">{p.nombre}</h3>
              <p className="text-gray-500 text-sm h-12 line-clamp-2">{p.desc}</p>
            </div>
            
            {/* Barra de estado inferior */}
            <div className={`p-4 border-t flex justify-between items-center ${p.estado === 'votado' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'}`}>
              <span className="text-sm font-medium">
                {p.estado === 'votado' ? 'Votado anteriormente' : (seleccionado?.id === p.id ? 'Seleccionado' : 'No seleccionado')}
              </span>
              {p.estado === 'votado' && <span className="bg-white rounded-full p-1 shadow-sm">✕</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Sección de voto y comentario */}
      <div className="border-t pt-8">
        <h3 className="text-2xl font-bold mb-6">Tu voto: <span className={seleccionado ? "text-blue-600" : "text-gray-900"}>{seleccionado ? seleccionado.nombre : "Ninguno"}</span></h3>
        
        <label className="block text-gray-700 font-bold mb-2">Añadir comentario</label>
        <textarea 
          placeholder="Escribe tu comentario aquí..."
          className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all resize-none"
        ></textarea>

        <div className="flex justify-end gap-4 mt-8">
          <button 
            onClick={alVolver}
            className="px-10 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50"
          >
            Atrás
          </button>
          <button 
            onClick={() => {
                if (seleccionado) {
                // Simulamos una alerta de éxito para la demo
                alert(`¡Voto registrado con éxito para: ${seleccionado.nombre}!`);
                alVolver(); // <--- Esto es lo que te devuelve a las categorías
                }
            }}
            disabled={!seleccionado}
            className={`px-10 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                seleccionado 
                ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-100' 
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProyectosLista;