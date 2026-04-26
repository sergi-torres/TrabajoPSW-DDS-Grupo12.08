import React, { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EventSidebar } from "../components/layout/EventSidebar";
import { useConfigTiempos } from '../hooks/VotacionHooks/useConfigTiempos';
import { EventContext } from "../context/EventContext";
import { useAuth } from "../hooks/useAuth";
import { ArrowLeft, LogOut, Clock } from "lucide-react";
import { getDashboard } from "../api/orgDashboardApi";

const ConfigTiempoVotacionPage: React.FC = () => {
  const { eventoId } = useParams<{ eventoId: string }>();
  const {
    categorias,
    obtenerCategoriasPorEvento,
    guardarConfiguracion,
    estaGuardando,
    cargandoCategorias
  } = useConfigTiempos();

  // --- ESTADOS DEL FORMULARIO ---
  const [categoriaSel, setCategoriaSel] = useState<string>("");
  const [fechaIni, setFechaIni] = useState<string>("");
  const [fechaFin, setFechaFin] = useState<string>("");

  // --- ESTADOS DE CONTROL ---
  const [categoriaTieneDatos, setCategoriaTieneDatos] = useState<boolean>(false);
  const [mostrarModalBorrado, setMostrarModalBorrado] = useState<boolean>(false);
  const [huboIntentoGuardar, setHuboIntentoGuardar] = useState<boolean>(false);

  const navigate = useNavigate();
  const { logout } = useAuth();
  const { userRole, userColor, isCollapsed, clearEventContext } = useContext(EventContext) as any;
  const [eventInfo, setEventInfo] = useState<any>(null);

  const isPublicRole = userRole === "Público";

  // --- CARGA INICIAL ---
  const fetchEventInfo = useCallback(async () => {
    if (!eventoId || eventoId === "undefined") return;
    try {
      const data: any = await getDashboard(eventoId as any);
      setEventInfo(data.liveInfo);
    } catch (err) {
      console.error("Error cargando info del evento:", err);
    }
  }, [eventoId]);

  useEffect(() => {
    if (eventoId) {
      obtenerCategoriasPorEvento(eventoId);
      fetchEventInfo();
    }
  }, [eventoId, obtenerCategoriasPorEvento, fetchEventInfo]);

  const handleLogout = () => {
    logout();
    clearEventContext();
    navigate('/login');
  };

  // --- MANEJO DE SELECCIÓN DE CATEGORÍA ---
  const manejarCambioCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idSeleccionado = e.target.value;
    setCategoriaSel(idSeleccionado);
    setHuboIntentoGuardar(false); // Limpiamos errores previos

    if (!idSeleccionado) {
      limpiarCamposFechas();
      return;
    }

    // Buscamos la categoría en los datos que trajo la API
    const categoriaEncontrada = categorias.find((c: any) => c.categoriaId?.toString() === idSeleccionado || c.CategoriaId?.toString() === idSeleccionado);

    // Si la categoría existe y tiene fechas, rellenamos los inputs
    const fechaInicioBd = (categoriaEncontrada as any)?.fechaIni || (categoriaEncontrada as any)?.FechaIni || (categoriaEncontrada as any)?.fechaInicio;
    const fechaFinBd = (categoriaEncontrada as any)?.fechaFin || (categoriaEncontrada as any)?.FechaFin || (categoriaEncontrada as any)?.fechaTermino;

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
    if (fechaIni) {
      const inicio = new Date(fechaIni);
      const ahora = new Date();
      ahora.setSeconds(0, 0); // Ignoramos los segundos para ser precisos al minuto

      if (inicio <= ahora) {
        return "La fecha de inicio debe ser posterior a la actual.";
      }
    }

    if (fechaIni && fechaFin) {
      if (new Date(fechaFin) <= new Date(fechaIni)) {
        return "La fecha de cierre debe ser posterior a la de inicio.";
      }
    }
    return null;
  }, [fechaIni, fechaFin]);

  // Helper para obtener la hora actual en formato YYYY-MM-DDThh:mm ajustada a la zona local
  const getFechaLocalActualStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const faltanDatos = !categoriaSel || !fechaIni || !fechaFin;
  const botonGuardarDeshabilitado = faltanDatos || !!errorFechas || estaGuardando;

  // Obtenemos el título para mostrarlo en el modal
  const tituloCategoriaSel = (categorias.find((c: any) => c.categoriaId?.toString() === categoriaSel || c.CategoriaId?.toString() === categoriaSel) as any)?.nombre ||
    (categorias.find((c: any) => c.categoriaId?.toString() === categoriaSel || c.CategoriaId?.toString() === categoriaSel) as any)?.Nombre || "";

  // --- ACCIONES ---
  const ejecutarGuardado = async () => {
    setHuboIntentoGuardar(true);
    if (botonGuardarDeshabilitado) return;

    if (!eventoId) return;

    // Los nombres deben coincidir con tu ConfigTiemposRequestDto
    const dto = {
      EventoId: parseInt(eventoId),
      CategoriaId: parseInt(categoriaSel),
      Nombre: tituloCategoriaSel,
      FechaIni: fechaIni,
      FechaFin: fechaFin
    };

    const exito = await (guardarConfiguracion as any)(dto);
    if (exito) {
      setCategoriaTieneDatos(true);
      // Volvemos a pedir las categorías para actualizar el estado global si es necesario
      obtenerCategoriasPorEvento(eventoId);
    }
  };

  const ejecutarBorrado = async () => {
    if (!eventoId) return;
    const dtoNulo = {
      EventoId: parseInt(eventoId),
      CategoriaId: parseInt(categoriaSel),
      Nombre: tituloCategoriaSel,
      FechaIni: null,
      FechaFin: null
    };

    const exito = await (guardarConfiguracion as any)(dtoNulo, true);
    if (exito) {
      limpiarCamposFechas();
      setMostrarModalBorrado(false);
      obtenerCategoriasPorEvento(eventoId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-body relative">
      <EventSidebar />

      <div className="pb-[88px] lg:pb-12">
        <header
          className={`bg-blue-600 text-white p-6 lg:p-10 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}
          style={{ backgroundColor: userColor }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              {!isPublicRole ? (
                <button
                  onClick={() => navigate('/eventos')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl transition-all font-heading font-semibold text-sm group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={2.5} />
                  Volver a eventos
                </button>
              ) : (
                <div />
              )}

              {isPublicRole && (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 backdrop-blur-sm rounded-xl transition-all duration-200 border border-white/10 font-heading font-semibold text-sm group"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                  Salir
                </button>
              )}
            </div>

            <h1 className="text-3xl lg:text-4xl font-heading font-bold tracking-tight mb-2">
              {eventInfo?.eventName || "Cargando evento..."}
            </h1>
            <p className="text-blue-100 text-lg opacity-90">Configuración de Tiempos de Votación</p>
          </div>
        </header>

        <main className={`max-w-7xl mx-auto p-6 lg:p-10 space-y-12 transition-all duration-300 ${isPublicRole ? 'lg:pl-10' : (isCollapsed ? 'lg:pl-28' : 'lg:pl-80')}`}>

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

          <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" /> Automatizar Tiempos
              </h2>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-3xl">
                Programa el inicio y cierre de las votaciones. Selecciona una categoría y establece las fechas exactas para habilitarla automáticamente.
              </p>
            </div>

            <div className="p-6 lg:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

                {/* SELECTOR DE CATEGORÍA */}
                <div>
                  <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest">
                    Categoría
                  </label>
                  <select
                    value={categoriaSel}
                    onChange={manejarCambioCategoria}
                    disabled={cargandoCategorias}
                    className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all appearance-none cursor-pointer ${huboIntentoGuardar && !categoriaSel ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
                  >
                    <option value="">{cargandoCategorias ? "Cargando categorías..." : "-- Elige una categoría --"}</option>
                    {categorias.map((cat: any) => (
                      <option key={cat.categoriaId || cat.CategoriaId} value={cat.categoriaId || cat.CategoriaId}>
                        {cat.nombre || cat.Nombre}
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
                    min={getFechaLocalActualStr()}
                    disabled={!categoriaSel}
                    onChange={(e) => setFechaIni(e.target.value)}
                    onKeyDown={(e) => e.preventDefault()}
                    className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${errorFechas && errorFechas.includes("inicio") ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
                  />
                  {errorFechas && errorFechas.includes("inicio") && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">❌ {errorFechas}</p>
                  )}
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
                    onKeyDown={(e) => e.preventDefault()}
                    className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none cursor-pointer text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed ${errorFechas && errorFechas.includes("cierre") ? 'border-red-200 bg-red-50' : 'border-transparent focus:border-blue-500'}`}
                  />
                  {errorFechas && errorFechas.includes("cierre") && (
                    <p className="text-red-500 text-[10px] font-bold mt-2 ml-1">❌ {errorFechas}</p>
                  )}
                </div>
              </div>

              {/* ÁREA DE BOTONES */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                <button
                  disabled={botonGuardarDeshabilitado}
                  onClick={ejecutarGuardado}
                  className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all ${botonGuardarDeshabilitado
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white shadow-lg hover:bg-blue-700 active:scale-95'
                    }`}
                >
                  {estaGuardando ? "Guardando..." : "Guardar Cambios"}
                </button>

                {/* BOTÓN BORRAR */}
                {categoriaTieneDatos && (
                  <button
                    onClick={() => setMostrarModalBorrado(true)}
                    disabled={estaGuardando}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all bg-red-50 text-red-600 border border-transparent hover:border-red-200 hover:bg-red-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Borrar horas
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ConfigTiempoVotacionPage;
