import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Clock } from "lucide-react";
import { useConfigTiempos } from '../../hooks/VotacionHooks/useConfigTiempos';
import { ConfirmModal } from '../layout/ConfirmModal';


interface ConfigTiempoVotacionBarProps {
  eventoId: string;
}

const ConfigTiempoVotacionBar: React.FC<ConfigTiempoVotacionBarProps> = ({ eventoId }) => {
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

  useEffect(() => {
    if (eventoId) {
      obtenerCategoriasPorEvento(eventoId);
    }
  }, [eventoId, obtenerCategoriasPorEvento]);

  // --- MANEJO DE SELECCIÓN DE CATEGORÍA ---
  const manejarCambioCategoria = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idSeleccionado = e.target.value;
    setCategoriaSel(idSeleccionado);
    setHuboIntentoGuardar(false);

    if (!idSeleccionado) {
      limpiarCamposFechas();
      return;
    }

    const categoriaEncontrada = categorias.find((c: any) => 
      c.categoriaId?.toString() === idSeleccionado || c.CategoriaId?.toString() === idSeleccionado
    );

    const fechaInicioBd = (categoriaEncontrada as any)?.fechaIni || (categoriaEncontrada as any)?.FechaIni || (categoriaEncontrada as any)?.fechaInicio;
    const fechaFinBd = (categoriaEncontrada as any)?.fechaFin || (categoriaEncontrada as any)?.FechaFin || (categoriaEncontrada as any)?.fechaTermino;

    if (fechaInicioBd && fechaFinBd) {
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
      ahora.setSeconds(0, 0);

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

  const getFechaLocalActualStr = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const faltanDatos = !categoriaSel || !fechaIni || !fechaFin;
  const botonGuardarDeshabilitado = faltanDatos || !!errorFechas || estaGuardando;

  const tituloCategoriaSel = (categorias.find((c: any) => 
    c.categoriaId?.toString() === categoriaSel || c.CategoriaId?.toString() === categoriaSel) as any)?.nombre ||
    (categorias.find((c: any) => 
    c.categoriaId?.toString() === categoriaSel || c.CategoriaId?.toString() === categoriaSel) as any)?.Nombre || "";

  // --- ACCIONES ---
  const ejecutarGuardado = async () => {
    setHuboIntentoGuardar(true);
    if (botonGuardarDeshabilitado) return;

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
      obtenerCategoriasPorEvento(eventoId);
    }
  };

  const ejecutarBorrado = async () => {
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
    <>
      <ConfirmModal
        isOpen={mostrarModalBorrado}
        danger
        title="¿Borrar horas?"
        message={
          <>
            ¿Estás seguro de querer borrar las horas para la categoría <strong>{tituloCategoriaSel}</strong>?
            Si lo haces, la automatización se desactivará.
          </>
        }
        confirmLabel="Sí, borrar"
        cancelLabel="Cancelar"
        onConfirm={ejecutarBorrado}
        onCancel={() => setMostrarModalBorrado(false)}
        isLoading={estaGuardando}
      />


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
                {categorias.map((cat: any) => {
                  const id = cat.categoriaId || cat.CategoriaId;
                  const est = cat.estado || cat.Estado;
                  return (
                    <option key={id} value={id}>
                      {cat.nombre || cat.Nombre}{est ? ` (${est})` : ''}
                    </option>
                  );
                })}
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
    </>
  );
};

export default ConfigTiempoVotacionBar;
