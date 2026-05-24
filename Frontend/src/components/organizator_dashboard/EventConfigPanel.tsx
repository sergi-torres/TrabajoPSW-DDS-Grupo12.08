// components/organizator_dashboard/EventConfigPanel.tsx
import { useState, useEffect } from "react";
import { Sliders, Wrench, Clock, Users, MessageSquare, Lock, Edit } from "lucide-react";
import { ConfigSlider } from "../ui/ConfigSlider";
import { ConfigWrench } from "../ui/ConfigWrench";

interface EventConfigPanelProps {
  eventConfig: any;
  onUpdateConfig: (config: any) => void;
  juryWeight?: number;
  publicWeight?: number;
  onEditStep3?: () => void;
  allowComments?: boolean;
  onAllowCommentsChange?: (value: boolean) => void;
}

export function EventConfigPanel({ 
  eventConfig, 
  onUpdateConfig,
  juryWeight = 70,
  publicWeight = 30,
  onEditStep3,
  allowComments = false,
  onAllowCommentsChange
}: EventConfigPanelProps) {

  const [localConfig, setLocalConfig] = useState(eventConfig);

  // Sincronizar cuando cambia eventConfig desde fuera
  useEffect(() => {
    setLocalConfig(eventConfig);
  }, [eventConfig]);

  const handleChange = (key: string, value: any) => {
    const updated = { ...localConfig, [key]: value };
    setLocalConfig(updated);
    onUpdateConfig(updated);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Cabecera con ícono de llave inglesa */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-700">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-heading font-bold text-gray-900">
            Parámetros del Evento
          </h2>
          <p className="text-sm text-gray-500">Ajusta la configuración de la votación</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Sliders para valores numéricos */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Sliders className="w-4 h-4" />
            <span>Límites y Umbrales</span>
          </div>
          
          <ConfigSlider
            label="Límite de votos por usuario"
            value={localConfig.voteLimit}
            min={1}
            max={10}
            icon={<Users className="w-4 h-4" />}
            onChange={(val) => handleChange("voteLimit", val)}
          />

          <ConfigSlider
            label="Duración de categoría (minutos)"
            value={localConfig.categoryDuration || 30}
            min={5}
            max={120}
            step={5}
            unit=" min"
            icon={<Clock className="w-4 h-4" />}
            onChange={(val) => handleChange("categoryDuration", val)}
          />
        </div>

        {/* Configuración avanzada con Wrench */}
        <ConfigWrench title="Configuración Avanzada">
          <div className="space-y-4">
            {/* Toggle: Permitir comentarios */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">Permitir comentarios</span>
              </div>
              <button
                onClick={() => onAllowCommentsChange?.(!allowComments)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${allowComments ? "bg-purple-600" : "bg-gray-300"}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${allowComments ? "translate-x-6" : "translate-x-1"}
                  `}
                />
              </button>
            </div>
          </div>
        </ConfigWrench>

        {/* Configuración de ponderaciones - Solo lectura + botón editar */}
        <ConfigWrench title="Ponderación de Puntuaciones">
          <div className="space-y-4">
            {/* Mostrar valores actuales (solo lectura) */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Peso del Jurado</span>
              <span className="text-lg font-bold text-purple-600">{juryWeight}%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Peso del Público</span>
              <span className="text-lg font-bold text-blue-600">{publicWeight}%</span>
            </div>
            
            <p className="text-xs text-gray-400 text-center">
              Total: {juryWeight + publicWeight}%
            </p>

            {/* Botón para editar en el paso 3 */}
            <button
              onClick={onEditStep3}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar en Configuración
            </button>
            <p className="text-xs text-gray-400 text-center">
              Los pesos se configuran en el paso "Votaciones"
            </p>
          </div>
        </ConfigWrench>
      </div>
    </div>
  );
}