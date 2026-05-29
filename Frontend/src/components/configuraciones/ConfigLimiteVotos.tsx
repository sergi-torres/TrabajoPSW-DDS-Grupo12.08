import React, { useState, useEffect, useMemo } from 'react';
import { Settings, Sliders, CheckCircle2 } from 'lucide-react';
import { useConfigTiempos } from '../../hooks/VotacionHooks/useConfigTiempos';
import InfoTooltip from '../ui/InfoTooltip';

interface ConfigLimiteVotosProps {
  eventoId: string;
}

const ConfigLimiteVotos: React.FC<ConfigLimiteVotosProps> = ({ eventoId }) => {
  const {
    categorias,
    obtenerCategoriasControl,
    actualizarLimiteVotos,
    estaGuardando,
    cargandoCategorias
  } = useConfigTiempos();

  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [limiteGlobal, setLimiteGlobal] = useState<string>("");
  
  const [categoriaSelId, setCategoriaSelId] = useState<string>("");
  const [limitePersonalizado, setLimitePersonalizado] = useState<number>(1);

  useEffect(() => {
    if (eventoId) {
      obtenerCategoriasControl(eventoId);
    }
  }, [eventoId, obtenerCategoriasControl]);

  // En modo global aplica solo a Pendiente; en modo personalizado se puede elegir cualquier categoría
  const categoriasPendientes = useMemo(() => {
    return categorias.filter((c: any) => {
      const est = c.estado || c.Estado || "";
      return est.toLowerCase() === "pendiente";
    });
  }, [categorias]);

  const categoriaSeleccionada = useMemo(() => {
    if (!categoriaSelId) return null;
    return categorias.find((c: any) =>
        c.id?.toString() === categoriaSelId ||
        c.categoriaId?.toString() === categoriaSelId ||
        c.CategoriaId?.toString() === categoriaSelId
    );
  }, [categoriaSelId, categorias]);

  const togglePersonalizar = () => {
    if (!modoPersonalizado) {
      setLimiteGlobal("");
    } else {
      setCategoriaSelId("");
      setLimitePersonalizado(1);
    }
    setModoPersonalizado(!modoPersonalizado);
  };

  const handleConfirmar = async () => {
    if (modoPersonalizado) {
      if (!categoriaSelId) return;
      const exito = await actualizarLimiteVotos(eventoId, limitePersonalizado, parseInt(categoriaSelId));
      if (exito) {
        setCategoriaSelId("");
        setLimitePersonalizado(1);
        obtenerCategoriasControl(eventoId);
      }
    } else {
      if (!limiteGlobal) return;
      const exito = await actualizarLimiteVotos(eventoId, parseInt(limiteGlobal));
      if (exito) {
        setLimiteGlobal("");
        obtenerCategoriasControl(eventoId);
      }
    }
  };

  const maxProyectos = (categoriaSeleccionada as any)?.cantidadProyectos || (categoriaSeleccionada as any)?.CantidadProyectos || 1;
  const maximoRango = Math.max(1, maxProyectos);

  const botonDeshabilitado = estaGuardando || 
    (modoPersonalizado ? !categoriaSelId : !limiteGlobal);

  return (
    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mt-6">
      <div className="p-6 lg:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
                <Settings className="w-6 h-6 text-orange-600" /> Configurar límite de votos
                <InfoTooltip text="El límite de votos determina cuántos proyectos puede evaluar cada votante dentro de una categoría." />
            </h2>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-3xl">
                Define cuántos votos puede emitir un usuario. Aplícalo de forma global a todas las categorías pendientes o de forma personalizada.
            </p>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
          
          <div className="flex-1">
            <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest">
              Aplicar a todas las categorías pendientes del evento
            </label>
            <select
              value={limiteGlobal}
              onChange={(e) => {
                  setLimiteGlobal(e.target.value);
                  if (modoPersonalizado) setModoPersonalizado(false);
              }}
              disabled={cargandoCategorias || modoPersonalizado}
              className={`w-full p-4 bg-gray-50 border-2 rounded-2xl outline-none transition-all appearance-none cursor-pointer ${!limiteGlobal && !modoPersonalizado ? 'border-transparent focus:border-orange-500' : 'border-orange-200 bg-orange-50/50'}`}
            >
              <option value="">-- Selecciona el límite --</option>
              <option value="1">1 voto por categoría</option>
              <option value="2">2 votos por categoría</option>
              <option value="3">3 votos por categoría</option>
            </select>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={togglePersonalizar}
              disabled={estaGuardando}
              className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${modoPersonalizado 
                ? 'bg-gray-800 text-white shadow-lg hover:bg-gray-900' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              <Sliders size={18} />
              {modoPersonalizado ? "Modo Global" : "Personalizar"}
            </button>
            <button
              onClick={handleConfirmar}
              disabled={botonDeshabilitado}
              className={`px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 ${botonDeshabilitado
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 hover:bg-orange-700 active:scale-95'
                }`}
            >
              <CheckCircle2 size={18} />
              {estaGuardando ? "Guardando..." : "Confirmar"}
            </button>
          </div>
        </div>

        {modoPersonalizado && (
          <div className="mt-8 pt-6 border-t border-gray-100 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest">
                        Elige la categoría
                    </label>
                    <select
                        value={categoriaSelId}
                        onChange={(e) => {
                            setCategoriaSelId(e.target.value);
                            setLimitePersonalizado(1);
                        }}
                        className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-500 rounded-2xl outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">-- Selecciona una categoría --</option>
                        {categorias.map((cat: any) => {
                            const id = cat.id || cat.categoriaId || cat.CategoriaId;
                            const est = cat.estado || cat.Estado || "Pendiente";
                            return (
                                <option key={id} value={id}>
                                    {cat.nombre || cat.Nombre} ({est})
                                </option>
                            );
                        })}
                    </select>
                </div>

                {categoriaSeleccionada && (
                    <div className="animate-in fade-in duration-300">
                        <label className="text-gray-400 text-[11px] font-black uppercase mb-2 ml-1 block tracking-widest flex justify-between">
                            <span>Límite de Votos</span>
                            <span className="text-orange-600 font-bold">{limitePersonalizado} de {maxProyectos}</span>
                        </label>
                        <div className="bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
                            <input 
                                type="range" 
                                min="1" 
                                max={maximoRango} 
                                value={limitePersonalizado} 
                                onChange={(e) => setLimitePersonalizado(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-600"
                            />
                            <div className="flex justify-between text-xs text-gray-400 font-bold mt-3">
                                <span>1</span>
                                <span>{maximoRango}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ConfigLimiteVotos;
