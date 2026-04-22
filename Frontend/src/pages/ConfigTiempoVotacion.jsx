import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useConfigTiempos } from '../hooks/useConfigTiempos';

const ConfigTiempoVotacionPage = () => {
  const { eventoId } = useParams(); 
  const { 
    categorias, 
    obtenerCategoriasPorEvento, 
    guardarConfiguracion, 
    estaGuardando 
  } = useConfigTiempos();

  // --- ESTADOS DEL FORMULARIO ---
  const [categoriaSel, setCategoriaSel] = useState("");
  const [fechaIni, setFechaIni] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  
  // --- ESTADOS DE CONTROL ---
  const [categoriaTieneDatos, setCategoriaTieneDatos] = useState(false);
  const [mostrarModalBorrado, setMostrarModalBorrado] = useState(false);
  const [huboIntentoGuardar, setHuboIntentoGuardar] = useState(false);

  // --- CARGA INICIAL ---
  useEffect(() => {
    if (eventoId) {
      obtenerCategoriasPorEvento(eventoId);
    }
  }, [eventoId, obtenerCategoriasPorEvento]);

  // --- MANEJO DE SELECCIÓN DE CATEGORÍA ---
  const manejarCambioCategoria = (e) => {
    const idSeleccionado = e.target.value;
    setCategoriaSel(idSeleccionado);
    setHuboIntentoGuardar(false); // Limpiamos errores previos

    if (!idSeleccionado) {
      limpiarCamposFechas();
      return;
    }

    // Buscamos la categoría en los datos que trajo la API
    const categoriaEncontrada = categorias.find(c => c.id.toString() === idSeleccionado || c.Id?.toString() === idSeleccionado);

    // Si la categoría existe y tiene fechas, rellenamos los inputs
    // Nota: Las APIs en .NET suelen devolver JSON en camelCase (fechaIni), verificamos ambos por seguridad
    const fechaInicioBd = categoriaEncontrada?.fechaIni || categoriaEncontrada?.FechaIni;
    const fechaFinBd = categoriaEncontrada?.fechaFin || categoriaEncontrada?.FechaFin;

    if (fechaInicioBd && fechaFinBd) {
      // Formateamos para el input datetime-local (YYYY-MM-DDThh:mm)
      setFechaIni(fechaInicioBd.substring(0, 16));
      setFechaFin(fechaFinBd.substring(0, 16));
      setCategoriaTieneDatos(true);
    } else {
      limpiarCamposFechas();
    }
  };

  const limpiarCamposFechas = () => {
    setFechaIni("");
    setFechaFin("");
    setCategoriaTieneDatos(false);
  };

  // --- VALIDACIONES ---
  const errorFechas = useMemo(() => {
    if (fechaIni && fechaFin) {
      if (new Date(fechaFin) <= new Date(fechaIni)) {
        return "La fecha de cierre debe ser posterior a la de inicio.";
      }
    }
    return null;
  }, [fechaIni, fechaFin]);

  const faltanDatos = !categoriaSel || !fechaIni || !fechaFin;
  const botonGuardarDeshabilitado = faltanDatos || !!errorFechas || estaGuardando;

  // Obtenemos el título para mostrarlo en el modal
  const tituloCategoriaSel = categorias.find(c => c.id?.toString() === categoriaSel || c.Id?.toString() === categoriaSel)?.titulo || 
                             categorias.find(c => c.id?.toString() === categoriaSel || c.Id?.toString() === categoriaSel)?.Titulo || "";

  // --- ACCIONES ---
  const ejecutarGuardado = async () => {
    setHuboIntentoGuardar(true);
    if (botonGuardarDeshabilitado) return;

    // Los nombres deben coincidir con tu ConfigTiemposRequestDto
    const dto = {
      AutomatizacionActiva: true,
      CategoriaId: parseInt(categoriaSel),
      FechaIni: fechaIni,
      FechaFin: fechaFin
    };

    const exito = await guardarConfiguracion(dto);
    if (exito) {
      setCategoriaTieneDatos(true);
      // Volvemos a pedir las categorías para actualizar el estado global si es necesario
      if (eventoId) obtenerCategoriasPorEvento(eventoId);
    }
  };

  const ejecutarBorrado = async () => {
    const dtoNulo = {
      AutomatizacionActiva: false,
      CategoriaId: parseInt(categoriaSel),
      FechaIni: null,
      FechaFin: null
    };

    const exito = await guardarConfiguracion(dtoNulo, true);
    if (exito) {
      limpiarCamposFechas();
      setMostrarModalBorrado(false);
      if (eventoId) obtenerCategoriasPorEvento(eventoId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      
      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {mostrarModalBorrado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full mx-4 shadow-2xl">
            <h2 className="text-xl font-bold mb-2 text-gray-900">¿Borrar horas?</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              ¿Estás seguro de querer borrar las horas para la categoría <strong>{tituloCategoriaSel}</strong>? 
              Si lo haces, la automatización se desactivará.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setMostrarModalBorrado(false)} 
                disabled={estaGuardando}
                className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={ejecutarBorrado} 
                disabled={estaGuardando}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all flex justify-center"
              >
                {estaGuardando ? "Borrando..." : "Sí, borrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md w-full">
        <main className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100">
          
          {/* HEADER */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">Automatizar Tiempos</h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              Programa el inicio y cierre de las votaciones. Selecciona una categoría y establece las fechas exactas para habilitarla automáticamente.
            </p>
          </div>

          <div className="space-y-6">
            
            {/* SELECTOR DE CATEGORÍA */}
            <div>
              <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest">
                Categoría
              </label>
              <select 
                value={categoriaSel}
                onChange={manejarCambioCategoria}
                className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all appearance-none cursor-pointer ${huboIntentoGuardar && !categoriaSel ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
              >
                <option value="">-- Elige una categoría --</option>
                {categorias.map(cat => (
                  // Soportamos tanto la convención C# (Id, Titulo) como JSON estándar (id, titulo)
                  <option key={cat.id || cat.Id} value={cat.id || cat.Id}>
                    {cat.titulo || cat.Titulo}
                  </option>
                ))}
              </select>
              {huboIntentoGuardar && !categoriaSel && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">Selecciona una categoría para continuar.</p>
              )}
            </div>

            {/* FECHA INICIO */}
            <div>
              <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest">
                Inicio de Votación
              </label>
              <input 
                type="datetime-local" 
                value={fechaIni}
                disabled={!categoriaSel}
                onChange={(e) => setFechaIni(e.target.value)}
                className="w-full p-4 bg-gray-50 border-transparent border-2 rounded-2xl focus:border-blue-500 outline-none cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* FECHA FIN */}
            <div>
              <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest">
                Cierre de Votación
              </label>
              <input 
                type="datetime-local" 
                value={fechaFin}
                disabled={!categoriaSel}
                onChange={(e) => setFechaFin(e.target.value)}
                className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${errorFechas ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
              />
              {errorFechas && (
                <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">❌ {errorFechas}</p>
              )}
            </div>
          </div>

          {/* ÁREA DE BOTONES */}
          <div className="mt-10 flex flex-col gap-3">
            <button 
              disabled={botonGuardarDeshabilitado}
              onClick={ejecutarGuardado}
              className={`w-full py-4 rounded-2xl font-bold transition-all ${
                botonGuardarDeshabilitado
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95'
              }`}
            >
              {estaGuardando ? "Guardando..." : "Guardar Cambios"}
            </button>

            {/* BOTÓN BORRAR - Se muestra solo si hay fechas guardadas */}
            {categoriaTieneDatos && (
              <button 
                onClick={() => setMostrarModalBorrado(true)}
                disabled={estaGuardando}
                className="w-full py-4 rounded-2xl font-bold transition-all bg-red-50 text-red-600 border border-transparent hover:border-red-200 hover:bg-red-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Borrar horas
              </button>
            )}
          </div>
          
        </main>
      </div>
    </div>
  );
};

export default ConfigTiempoVotacionPage;